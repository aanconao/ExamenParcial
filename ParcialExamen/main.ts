import { MongoClient, ObjectId } from "mongodb";
import { AutoresModel, LibroModel } from "./types.ts";
import { fromModelToLibro } from "./utilities.ts";

const url = Deno.env.get("MONGO_URL");
if (!url) {
  console.error("Error obtener MONGO_URL");
  Deno.exit(1);
}
const client = new MongoClient(url);
await client.connect();
console.info("TODO BIEN MONGO");

const dataBase = client.db("Parcial");

const autoresCollection = dataBase.collection<AutoresModel>("Autores");
const librosCollection = dataBase.collection<LibroModel>("Libros");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  if (method === "POST") {
    if (path === "/autor") {
      const autor = await req.json();
      if (!autor.nombre || !autor.biografia) {
        return new Response("Error POST autor", { status: 404 });
      }
      const autorDB = await autoresCollection.findOne({ nombre: autor.nombre });
      if (autorDB) return new Response("bad request", { status: 404 });
      const { insertedId } = await autoresCollection.insertOne({
        nombre: autor.nombre,
        biografia: autor.biografia,
      });
      return new Response(
        JSON.stringify({
          nombre: autor.nombre,
          biografia: autor.biografia,
          id: insertedId,
        }),
        { status: 201 }
      );
    } else if (path === "/libro") {
      const libro = await req.json();
      if (!libro.titulo || !libro.copiasDisponibles) {
        return new Response("Error POST libro", { status: 404 });
      }
      const libroDB = await librosCollection.findOne({ titulo: libro.titulo });
      if (libroDB) return new Response("Bad request", { status: 404 });
      const { insertedId } = await librosCollection.insertOne({
        titulo: libro.titulo,
        copiasDisponibles: libro.copiasDisponibles,
        autor: [],
      });
      return new Response(
        JSON.stringify({
          titulo: libro.titulo,
          copiasDisponibles: libro.copiasDisponibles,
          autor: [],
          id: insertedId,
        }),
        { status: 201 }
      );
    }
  } else if (method === "GET") {
    if (path === "/libros") {
      const titulo = url.searchParams.get("titulo");
      if (!titulo) return new Response("No titulo", { status: 404 });
      if (titulo) {
        const libroDB = await librosCollection.find({ titulo }).toArray();
        const libros = await Promise.all(
          libroDB.map((p) => fromModelToLibro(p, autoresCollection))
        );
        return new Response(JSON.stringify(libros), { status: 201 });
      }
    } else if (path === "/libro") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("No id", { status: 404 });
      const libroDB = await librosCollection.findOne({ _id: new ObjectId(id) });
      if (!libroDB) return new Response("libro no encontrado", { status: 404 });
      const libro = await fromModelToLibro(libroDB, autoresCollection);
      return new Response(JSON.stringify(libro), { status: 201 });
    }
  } else if (method === "DELETE") {
    if (path === "/libro") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("No id", { status: 404 });

      const { deletedCount } = await librosCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deletedCount === 0)
        return new Response("no encontrado", { status: 404 });
    }
    return new Response("Borrado exitosamente", { status: 201 });
  }
  return new Response("Fallo en el handler", { status: 404 });
};

Deno.serve({ port: 3000 }, handler);
