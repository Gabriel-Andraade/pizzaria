import postgres from "postgres";
            import "dotenv/config";



const sql = postgres({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Se a porta estiver errada, altere
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
});



export default sql;
