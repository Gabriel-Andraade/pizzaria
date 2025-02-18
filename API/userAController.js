import sql from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

async function usuarioExiste(email) {
  const user = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return user.length > 0 ? user[0] : null;
}

export async function register(req) {
  try {
    const { name, email, password, cpf } = await req.json();

    if (!name || !email || !password || !cpf) {
      return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios!" }), { status: 400 });
    }

    if (await usuarioExiste(email)) {
      return new Response(JSON.stringify({ message: "Email já cadastrado." }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`INSERT INTO users (name, email, password, cpf) VALUES (${name}, ${email}, ${hashedPassword}, ${hashedPassword})`;

    return new Response(JSON.stringify({ message: "Usuário criado com sucesso!" }), { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return new Response(JSON.stringify({ message: "Erro ao registrar usuário." }), { status: 500 });
  }
}

export async function login(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email e senha são obrigatórios!" }), { status: 400 });
    }

    const user = await usuarioExiste(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ message: "Credenciais inválidas." }), { status: 401 });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro: corpo da requisição inválido!" }), { status: 400 });
  }
}

export async function getUser(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "ID é obrigatório." }), { status: 400 });
    }

    const user = await sql`SELECT id, name, email, cpf FROM users WHERE id = ${id}`;

    if (user.length === 0) {
      return new Response(JSON.stringify({ message: "Usuário não encontrado." }), { status: 404 });
    }

    return new Response(JSON.stringify(user[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro: corpo da requisição inválido!" }), { status: 400 });
  }
}

export async function deleteUser(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "ID é obrigatório." }), { status: 400 });
    }

    await sql`SELECT id FROM users WHERE id = ${id}`;

    await sql`DELETE FROM users WHERE id = ${id}`;
    return new Response(JSON.stringify({ message: "Usuário deletado com sucesso." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro: corpo da requisição inválido!" }), { status: 400 });
  }
}

export async function updateUser(req) {
  try {
    const { id, name, email, cpf } = await req.json();

    if (!id || !name || !email || !cpf) {
      return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios!" }), { status: 400 });
    }

    await sql`SELECT id FROM users WHERE id = ${id}`;

    await sql`UPDATE users SET name = ${name}, email = ${email}, cpf = ${email} WHERE id = ${id}`;

    return new Response(JSON.stringify({ message: "Usuário atualizado com sucesso." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro: corpo da requisição inválido!" }), { status: 400 });
  }
}