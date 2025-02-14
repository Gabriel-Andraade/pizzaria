import sql from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";



function erroAleatorio() {
  return mensagensErro[Math.floor(Math.random() * mensagensErro.length)];
}

export async function register(req) {
  

  const { name, email, password, cpf } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (name, email, password, cpf) VALUES (${name}, ${email}, ${hashedPassword}, ${cpf})`;
    console.log("Novo usuário registrado com sucesso");
    return new Response(JSON.stringify({ message: "Usuário criado! " }), { status: 201 });
  } catch (error) {
    
    return new Response(JSON.stringify({ message: erroAleatorio() }), { status: 500 });
  }
}
