require("dotenv").config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const user = require("./database/User");

const app = express();
const port = 3000

//app.use(express.json());
app.use(express.urlencoded());

app.post('/register', async (req, res, next) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const alreadyExist = await user.exist(email);
        if (!(username && email && password)) {
            res.status(400).send("All input is required");
            return next();
        }
        if (!alreadyExist) {
            //Encrypt user password
            console.log(`${username} ${email} ${password}`)
            const salt = await bcrypt.genSalt(10);
            encryptedPassword = await bcrypt.hash(password, salt);
            await user.create(username, email, encryptedPassword);
            res.status(200).send("User successfully created!");
            return next();
        }
        res.status(400).send("Failed to create user");
        return next();
    } catch (error) {
        return next(error);
    }
});

app.get('/login', async (req, res, next) => {
    try {
        const { email, password } = req.query;

        if (!(email && password)) {
            res.status(400).send("An email and password is required");
            return next();
        }

        const userObj = await user.get(email);

        if (userObj && (await bcrypt.compare(password, userObj.passwordHash))) {
            const token = jwt.sign(
            {
                user_id: userObj.id,
                email,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "15m",
            });
            res.status(200).json({ token: token });
            return next();
        }
        res.status(400).send("Invalid Credentials");
    } catch (error) {
        console.log(error);
        return next(error);
    }
});

app.post("/welcome", user.verifyToken, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.listen(port, () => {
    console.log(`Ijoo app listening at http://localhost:${port}`);
});