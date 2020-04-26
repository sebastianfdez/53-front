/* eslint-disable global-require */
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import * as express from 'express';
import { join } from 'path';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

enableProdMode();

(global as any).XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const app = express();
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');
const routes = [
    { path: '/es/*', view: 'es/index', bundle: require(join(DIST_FOLDER, 'server', 'es', 'main')) },
    { path: '/fr/*', view: 'fr/index', bundle: require(join(DIST_FOLDER, 'server', 'fr', 'main')) },
    { path: '/*', view: 'index', bundle: require(join(DIST_FOLDER, 'server', 'main')) },
];

// Load your engine
app.engine('html', (filePath, options: any, callback) => {
    options.engine(
        filePath,
        { req: options.req, res: options.res },
        callback,
    );
});

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'la-53'));

app.get('*.*', express.static(join(DIST_FOLDER, 'la-53')));
routes.forEach((route) => {
    app.get(route.path, (req, res) => {
        res.render(route.view, {
            req,
            res,
            engine: ngExpressEngine({
                bootstrap: route.bundle.AppServerModuleNgFactory,
                providers: [provideModuleMap(route.bundle.LAZY_MODULE_MAP)],
            }),
        });
    });
});

app.listen(PORT, () => {
    console.log(`Node server listening on port ${PORT}`);
});
export default app;
