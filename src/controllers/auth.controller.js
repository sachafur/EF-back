import User from "../models/user.model.js"
import ResponseBuilder from "../utils/builders/responseBuilder.js"
import ENVIROMENT from "../config/enviroment.config.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import{ sendEmail } from "../utils/mail.util.js"
import UserRepository from "../repositories/user.repository.js"




export const registerUserController = async (req, res) => {
    try{
        const { name, email, password} = req.body

        if(email){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El email no es valido'
                }
            )
            .build()
            return res.status(400).json(response)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = jwt.sign(
            {
                email: email
            }, ENVIROMENT.JWT_SECRET, {
            expiresIn: 'id'
        })
        const url_verification = `http://localhost:${ENVIROMENT.PORT}/api/auth/verify/${verificationToken}`
        await sendEmail({
            to: email,
            subject: 'Valida tu correo electronico',
            html:`
            <h1>Verificacion de correo electronico</h1>
            <p>Haga click en el boton de abajo para verificar</p>
            <a
                style='background-color: 'black'; color: 'white; padding: 5px; border-radius: 5px;'
                herf="${url_verification}"
            >Haga click aqui</a> 
            `
        })
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            emailVerified: false
        })

        await newUser.save()


        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Created')
        .setPayload({})
        .build()
        return res.status(201).json(response)
    }
    catch(error){
        if(error.code === 11000){
            res.sendStatus(400)
        }
        console.error('Error al registrar usuario:', error)
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server Error')
        .setPayload(
            {
                detail: error.message,
            }
        )
        .build()
        res.status(500).json(response)
    }

} 


export const verifyMailValidationTokenController = async (req, res) => {
    try{
        const {vercation_token} = req.params
        if(!vercation_token){
            const response = new ResponseBuilder().setOK(false)
            .setStatus(400)
            .setPayload({
                'detail':'Falta enviar token'
            })
            .build()
            return res.json(response)
        }

        const decoded = jwt.verify(verification_token, ENVIROMENT.JWT_SECRET)

        const user = await User.findOne({email: decoded.email})
        if(!user){

        }
        user.emailVerified = true


        await user.save()
        const response = new ResponseBuilder()
        .setOK(true)
        .setMessage()
        .setStatus()
        .setPayload({
            message: "Usuario validado"
        })
        .build()
        res.json(response)
    }
    catch(error){
        console.error(error)
    }
}

export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            const response = new ResponseBuilder()
            .setOK()
            .setStatus()
            .setMessage()
            .setPayload({
                detail: 'El mail no esta registrado'
            })
            .build()
            return res.json(response) 
        }
        if(!user.emailVerified){
            const response = new ResponseBuilder()
            .setOK(false)
            .setStatus(403)
            .setMessage('El email no esta verificado')
            .setPayload(
                {
                    detail: 'Por favor verifica tu correo antes de iniciar sesion'
                }
            )
            .build()
            return res.json(response)
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword){
            const response = new ResponseBuilder()
            .setOK(false)
            .setStatus(401)
            .setMessage('Credenciales ivalidas')
            .setPayload({
                detail: 'Contraseña icorrecta'
            })
            .build()
            return res.json(response)
        }
        const token = jwt.sign(
            {
                email: user.email,
                id: user._id,
                role: user.role
            },
            ENVIROMENT.JWT_SECRET,
            { expiresIn: '1d'}
        )
        const response = new ResponseBuilder()
        .setOK(true)
        .setStatus(200)
        .setMessage('Logueado')
        .setPayload({
            token,
            user: {
                id: user._id, 
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        .build()
        res.json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOK(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        res.json(response) 
    }
}

export const forgotPasswordController = async (req, res) => {
    try{
        const {email} = req.body
        
        const user = await UserRepository.obtenerPorEmail(email)
        if(!user){
          return res.status(401).json(responseBuilder(false, 401, "USER_NOT_FOUND", { detail: "User is not in de data base, please register your self"}));        
        }
        
        const resetToken = jwt.sign({email: user.email}, ENV.JWT_SECRET,{
            expiresIn: "1h",
        });
        const resetUrl = `${ENV.FRONT_URL}/reset-password/${resetToken}`;

        sendEmail({
            to: user.email,
            subject: 'Restablezca la Contraseña',
            html:`
                <div>
                    <h1>Solicitaste restablecer la contraseña<h1>
                    <a href='${restURL}'>Restablecer contraseña</a>
                <div>
                `
        });

        const response = new ResponseBuilder()
        .setOK(true)
        .setStatus(200)
        .setMessage('Se envio el correo')
        .setPayload({
            detail: 'Se envio un correo electronico para restablecer la contraseña.'
        })
        .build()
        return res.json()
    }
    catch(error){}
}

export const resetTokenController = async (req, res) => {
    try {
        const { password } = req.body
        const { reset_token } = req.params

        if(!password){
            const response = new ResponseBuilder()
            .setOK(false)
            .setStatus(400)
            .setMessage('Escriba la nueva contraseña')
            .setPayload({
                detail: 'Falta la contraseña nueva'
            })
            .build()
            return res.json(response)

        }
        if (!reset_token) {
            const response = new ResponseBuilder()
                .setOK(false)
                .setStatus(400)
                .setMessage('Token incorrecto')
                .setPayload({
                    detail: 'El reset_token se vencio o no es correcto'
                })
                .build()
            return res.json(response)
        }

        const decoded = jwt.verify(reset_token, ENVIROMENT.JWT_SECRET)

        console.log('Token decodificado', decoded);

        if(!decoded){
            const response = new ResponseBuilder()
                .setOK()
                .setStatus()
                .setMessage()
                .setPayload({
                    detail: 'Fallo la verificacion del token'
                })
                .build()
            return res.json(response)
        }

        const {email} = decoded
        
        const user = await UserRepository.obtenerPorEmail(email)
        if(!user){
            const response = new ResponseBuilder()
                .setOK(false)
                .setStatus(400)
                .setMessage('Nose encontro al usuario')
                .setPayload({
                    detail: 'Usuario inexistente o credenciales incorrectas'
                })
                .build()
            return res.json(response)
        }
        const encriptedPassword = await bcrypt.hash(password, 10);

        user.password = encriptedPassword
        await user.save()

        const response = new ResponseBuilder()
            .setOK(true)
            .setStatus(200)
            .setMessage('Contraseña')
            .setPayload({
                detail: 'Contraseña actualizada actualizada'
            })
        res.status(200).json(response)

    }
    catch (error){
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
}
/*export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Bad request')
                .setPayload(
                    {
                        detail: 'Name, Email and Password are required!'
                    }
                )
                .build()
            return res.status(400).json(response);
        }*/