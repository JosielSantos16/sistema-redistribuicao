import mongoose from "mongoose";

class Database {
  constructor() {
    this.mongo();
  }

  mongo() {
    const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/sistema-redistribuicao";

    this.mongoConnection = mongoose
      .connect(mongoUrl)
      .then(() => console.log("MongoDB conectado com sucesso!"))
      .catch((err) => {
        console.log("Erro ao conectar no MongoDB:");
        console.error(err);
      });
  }
}

export default new Database();