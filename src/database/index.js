import mongoose from "mongoose";

class Database {
  constructor() {
    this.mongo();
  }

  mongo() {
    this.mongoConnection = mongoose
      .connect("mongodb://127.0.0.1:27017/sistema-redistribuicao")
      .then(() => console.log("MongoDB conectado com sucesso!"))
      .catch((err) => {
        console.log("Erro ao conectar no MongoDB:");
        console.error(err);
      });
  }
}

export default new Database();