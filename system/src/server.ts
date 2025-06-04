import { serve } from "bun";
import { readFile } from "fs/promises";
import { join } from "path";
import { getCepInfo } from "./utils/cep";
import { calculateDelivery } from "./utils/frete";
import { simulatePayment } from "./payment";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = 3000;

async function serveStaticFile(filePath: string): Promise<Response> {
  try {
    const absolutePath = join(__dirname, "../../front", filePath);
    const fileContent = await readFile(absolutePath);
    const ext = filePath.split(".").pop();

    const contentType =
      {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        json: "application/json",
      }[ext || ""] || "application/octet-stream";

    return new Response(fileContent, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(res.body, { ...res, headers });
}

serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const { pathname, searchParams } = url;
    const method = req.method;

    console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

    if (method === "OPTIONS")
      return withCors(new Response(null, { status: 204 }));

    if (pathname === "/api/cep" && method === "GET") {
      const zip = searchParams.get("cep");
      if (!zip)
        return withCors(jsonResponse({ error: "ZIP code not provided" }, 400));

      try {
        const data = await getCepInfo(zip);
        return withCors(jsonResponse(data));
      } catch (err: any) {
        return withCors(jsonResponse({ error: err.message }, 400));
      }
    }

    if (pathname === "/api/frete" && method === "GET") {
      const zip = searchParams.get("cep");
      if (!zip)
        return withCors(jsonResponse({ error: "ZIP code not provided" }, 400));

      try {
        const delivery = await calculateDelivery(zip);
        return withCors(jsonResponse(delivery));
      } catch (err: any) {
        return withCors(jsonResponse({ error: err.message }, 400));
      }
    }

    if (pathname === "/api/pagar" && method === "POST") {
      const body = await req.json();
      const result = await simulatePayment(body);
      return withCors(jsonResponse(result));
    }

    if (pathname === "/") return serveStaticFile("index.html");
    if (pathname === "/thankyou.html") return serveStaticFile("thankyou.html");
    if (pathname.startsWith("/front/")) {
      const filePath = pathname.replace("/front/", "");
      return serveStaticFile(filePath);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🍕 Server running at http://localhost:${port}`);

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
