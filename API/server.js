import { serve } from "bun";
import routes from "./userRoute.js";
const server = serve({
  port: 5432,
  fetch(req) {
    const url = new URL(req.url);
    console.log(` ${url.pathname}`);

    const route = routes.get(url.pathname);
    if (!route) {
        return new Response("não existente", { status: 404 });
      }

   
    return route(req);
  },
});

console.log(`Servidor rodando em http://localhost:4604`);
