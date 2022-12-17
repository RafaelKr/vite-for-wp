import { createServer } from 'net';

export type ChoosePortOptions = {
	host?: string;
	port: number;
};

/**
 * Choose port
 *
 * Stolen from vite.
 *
 * @param {ChoosePortOptions} options Options.
 * @return {Promise<number>}  Chosen port.
 */
export default async function choose_port(
	options: ChoosePortOptions = { port: 3000, host: 'localhost' },
): Promise< number > {
	const server = createServer();

	return new Promise( ( resolve, reject ) => {
		let { port, host } = options;

		const handle_error = ( e: Error & { code?: string } ) => {
			if ( e.code === 'EADDRINUSE' ) {
				server.listen( ++port, host );
			} else {
				server.removeListener( 'error', handle_error );
				reject( e );
			}
		};

		server.on( 'error', handle_error );

		server.listen( port, host, () => {
			server.removeListener( 'error', handle_error );
			server.close();
			resolve( port );
		} );
	} );
}
