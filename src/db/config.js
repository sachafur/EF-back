import mongoose from "mongoose";
import ENVIROMENT from "../config/enviroment.config.js";

mongoose.connect(ENVIROMENT.DB_URL)
.then(
    () => {
        console.log('Connexion establecida con la base de datos')
    }
)
.catch(
    (error) => {
        console.error('Error de conexion con la base de datos')
    }
)

export default mongoose