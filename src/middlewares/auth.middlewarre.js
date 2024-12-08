import ENVIROMENT from "../config/enviroment.config.js";
import ResponseBuilder from "../utils/builders/responseBuilder.js";
import jwt from 'jsonwebtoken'

export const verifyTokenMiddleware = (roles_permitidos = []) => {
    return (req, res, next) => {
        try{
            const auth_header = req.headers['authorization']

            if (!auth_header) {
                const response = new ResponseBuilder()
                    .setOK(false)
                    .setMessage('Falta la autorizacion')
                    .setStatus(401)
                    .setPayload({
                        detail: 'Se esperaba token de autorizacion'
                    })    
                    .build()

                return res.status(401).json(response)    
            }
            const decoded = jwt.verify(access_token, ENVIROMENT.JWT_SECRET)
            req.user = decoded


            if(roles_permitidos.length && !roles_permitidos.includes(req.user.role)){
                const response = new ResponseBuilder()
                    .setOK(false)
                    .setMessage('Acceso restringido')
                    .setStatus(403)
                    .setPayload({
                        detail: 'No tienes los permisos para realizar esta operacionn'
                    })
                    .build()

                return res.setStatus(403).json(response)
            }
            return next()
        }
        catch (error) {
            const response = new ResponseBuilder()
                .setOK(false)
                .setMessage('Error al autentificar')
                .setStatus(401)
                .setPayload(
                    {
                        detail: error.message
                    }
                )
                .build()
            return res.status(401).json(response)
        }
    }
} 

export const verifyApiKeyMiddleware = (req, res, next) => {
    console.log('chau')
    try{
        const apikey_header = req.headers['x-api-key']
        if (!apikey_header) {
            const response = new ResponseBuilder()
                .setOK(false)
                .setMessage('Unauthorized')
                .setStatus(401)
                .setPayload({
                    detail: 'se esperaba una api-key'
                })
                .build()

            return res.setStatus(401)
        }
        if (apikey_header !== ENVIROMENT.API_KEY_INTERN) {
            const response = new ResponseBuilder()
                .setOK(false)
                .setMessage('Unauthorized')
                .setStatus(401)
                .setPayload({
                    detail: 'se esperaba una api-key'
                })
                .build()

            return res.status(401).json(response)
        }
        next()
    }
    catch (error) {
        const response = new ResponseBuilder()
            .setOK(false)
            .setMessage('Internal server error')
            .setStatus(500)
            .setPayload({
                detail: 'no se pudo validar la api-key'
            })
            .build()

        return res.status(500).json(response)
    }
}