/* global process:false */

import type { Plugin } from 'vite';
import fs from 'fs';

export default function dev_server_manifest(): Plugin {
	const plugins_to_check = [ 'vite:react-refresh' ];

	return {
		apply: 'serve',
		name: 'v4wp-dev-server-manifest',

		configResolved( config ) {
			const { base, build, plugins, server } = config;

			const data = {
				base,
				origin: server.origin,
				port: server.port,
				plugins: plugins_to_check.filter( i => plugins.some( ( { name } ) => name === i ) ),
			};

			if ( ! fs.existsSync( build.outDir ) ) {
				fs.mkdirSync( build.outDir );
			}

			const prod_manifest_file = build.outDir + '/manifest.json';

			// Remove build manifest as the PHP helper uses it to determine
			// which manifest to load when enqueueing assets.
			if ( fs.existsSync( prod_manifest_file ) ) {
				fs.rmSync( prod_manifest_file );
			}

			const dev_manifest_file = build.outDir + '/vite-dev-server.json';

			const cleanUp = () => {
				if ( fs.existsSync( dev_manifest_file ) ) {
					fs.rmSync( dev_manifest_file );
				}

				process.exit();
			};

			fs.writeFileSync( dev_manifest_file, JSON.stringify( data ), 'utf8' );

			process.once( 'SIGINT', cleanUp );
			process.once( 'SIGTERM', cleanUp );
		},
	};
}
