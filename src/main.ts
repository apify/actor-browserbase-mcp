/**
 * Serves as an Actor MCP SSE server entry point.
 * This file needs to be named `main.ts` to be recognized by the Apify platform.
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Actor } from 'apify';
import type { Request, Response } from 'express';
import express from 'express';

import log from '@apify/log';
import { chargeForSessions, server } from './browserbase.js';

const HEADER_READINESS_PROBE = 'X-Readiness-Probe';

export type Input = {
    port?: number;
};

const STANDBY_MODE = Actor.getEnv().metaOrigin === 'STANDBY';

await Actor.init();

const memory_mbytes = parseInt(process.env.ACTOR_MEMORY_MBYTES || '0', 10);
const memory_gbs = Math.ceil(memory_mbytes / 1024) || 1;
await Actor.charge({
    eventName: "actor-start-gb",
    count: memory_gbs,
});
log.info(`Charged ${memory_gbs} GB for actor start`);

Actor.on('aborting', async () => {
    log.info('Actor is aborting, charging for sessions...');
    await chargeForSessions();
});

const HOST = Actor.isAtHome() ? process.env.ACTOR_STANDBY_URL as string : 'http://localhost';
const PORT = Actor.isAtHome() ? Number(process.env.ACTOR_STANDBY_PORT) : 3001;

if (!process.env.APIFY_TOKEN) {
    log.error('APIFY_TOKEN is required but not set in the environment variables.');
    process.exit(1);
}

const input = (await Actor.getInput<Partial<Input>>()) ?? ({} as Input);
log.info(`Loaded input: ${JSON.stringify(input)} `);

if (STANDBY_MODE) {
    setupExitWatchdog(server);
    log.info('Actor is running in the STANDBY mode.');
    startExpressServer(PORT, server).catch((e) => {
        log.error(`Failed to start Express server: ${e}`);
        process.exit(1);
    });
} else {
    const msg = `Actor is not designed to run in the NORMAL model (use this mode only for debugging purposes)`;
    log.error(msg);
    await Actor.fail(msg);
}

function setupExitWatchdog(server: Server) {
    const handleExit = async () => {
        await chargeForSessions();
        setTimeout(() => process.exit(0), 15000);
        await server.close();
        process.exit(0);
    };

    process.stdin.on('close', handleExit);
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
}

function getHelpMessage(host: string): string {
    return `Connect to ${host}/sse to establish a connection.`;
}

function getActorRunData() {
    return {
        actorId: Actor.getEnv().actorId,
        actorRunId: Actor.getEnv().actorRunId,
        startedAt: new Date().toISOString(),
    };
}

async function startExpressServer(port: number, server: Server) {
    const app = express();

    // Midleware to lock down access to the Actor
    app.use((_req: Request, res: Response, next) => {
        const allowedUserIDs = process.env.ALLOWED_USER_IDS?.split(',') ?? [];
        if (allowedUserIDs.length > 0 && !allowedUserIDs.includes(process.env.APIFY_USER_ID as string)) {
            const msg = `The Actor is in lockdown mode. You are not allowed to access this resource.`;
            log.error(msg);
            res.status(403).json({
                error: msg,
            });
            return;
        }

        next();
    });

    let transportSSE: SSEServerTransport;
    const sessions = new Map<string, SSEServerTransport>();

    function respondWithError(res: Response, error: unknown, logMessage: string, statusCode = 500) {
        log.error(`${logMessage}: ${error}`);
        if (!res.headersSent) {
            res.status(statusCode).json({
                jsonrpc: '2.0',
                error: {
                    code: statusCode === 500 ? -32603 : -32000,
                    message: statusCode === 500 ? 'Internal server error' : 'Bad Request',
                },
                id: null,
            });
        }
    }

    app.get('/', async (req: Request, res: Response) => {
        if (req.headers && req.get(HEADER_READINESS_PROBE) !== undefined) {
            log.debug('Received readiness probe');
            res.status(200).json({ message: 'Server is ready' }).end();
            return;
        }
        try {
            log.info('Received GET message at root');
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.status(200).json({
                message: `Actor is using Model Context Protocol. ${getHelpMessage(HOST)}`,
                data: getActorRunData(),
            }).end();
        } catch (error) {
            respondWithError(res, error, 'Error in GET /');
        }
    });

    app.get('/sse', async (_req: Request, res: Response) => {
        try {
            log.info('Received GET message at /sse');
            transportSSE = new SSEServerTransport('/message', res);

            const originalSend = transportSSE.send.bind(transportSSE);
            transportSSE.send = async (message) => {
                log.info(`Sent SSE message to session ${transportSSE.sessionId}`);
                await Actor.pushData({ message });
                // Process message and extract/save any image content
                return originalSend(message);
            };

            sessions.set(transportSSE.sessionId, transportSSE);
            res.on('close', () => {
                sessions.delete(transportSSE.sessionId);
                server.close().catch((e) => log.error(e));
            });
            await server.connect(transportSSE);
        } catch (error) {
            respondWithError(res, error, 'Error in GET /sse');
        }
    });

    app.post('/message', async (req: Request, res: Response) => {
        try {
            log.info('Received POST message at /message');
            const { searchParams } = new URL(`http://localhost${req.url}`);
            const sessionId = searchParams.get('sessionId');
            if (!sessionId) {
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: Missing sessionId',
                    },
                    id: null,
                });
                return;
            }
            const transport = sessions.get(sessionId);
            if (!transport) {
                res.status(404).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: Session not found',
                    },
                    id: null,
                });
                return;
            }
            log.info(`Received POST message for sessionId: ${sessionId}`);
            await transport.handlePostMessage(req, res);
        } catch (error) {
            respondWithError(res, error, 'Error in POST /message');
        }
    });

    app.listen(port, () => {
        const url = Actor.isAtHome() ? `${HOST}` : `http://localhost:${port}`;
        log.info(`Listening on ${url}`);
        log.info('Put this in your client config:');
        log.info(JSON.stringify({
            mcpServers: {
                browserbase: {
                    url,
                },
            },
        }, undefined, 2));
    });
}
