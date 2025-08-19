const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true
}));

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'f36b8aef1634da',
        pass: 'ce375e9d535e60'
    }
});

app.use('/api/private', (req, res, next) => {
    try {
        verifyUser(req);
        next();
    } catch (error) {
        console.error('/api/private error: ', error);
        res.status(401).json({ error: 'Invalid authorization' });
    }
});

app.get('/api/private/verifyinitialaccess', (req, res) => {
    try {
        verifyUser(req);
        res.status(200).json({ success: 'Valid authorizaiton' });
    } catch (error) {
        console.error('/api/verifyinitialaccess error: ', error);
        res.status(401).json({ error: 'Unauthorized access' });
    }
});

app.get('/api/private/getaccountinformation', async (req, res) => {
    try {
        const result = await pool.query(`SELECT email, is_verified, tier
                                         FROM users
                                         WHERE id = $1`, [req.user.id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('/api/getaccountinformation error: ', error);
        res.status(400).json({ error: 'Failed request to get account info' });
    }
});

app.get('/api/private/cancelemailchange', async (req, res) => {
    try {
        const result = await pool.query(`SELECT email
                                           FROM users
                                           WHERE id = $1`, [req.user.id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('/api/private/cancelemailchange error: ', error);
        res.status(404).json({ error: 'Cannot find email' });
    }
});

app.get('/api/private/loaddocumentcontent/:documentid', async (req, res) => {
    try {
        const result = await pool.query(`SELECT title, body
                                         FROM documents
                                         WHERE user_id = $1
                                            AND doc_id = $2`, [req.user.id, req.params.documentid]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('/api/private/loaddocumentcontent/:documentid error: ', error);
        res.status(400).json({ error: 'Cannot get document content' });
    }
});

app.get('/api/private/loaddocuments', async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, doc_id, title, modified_at
                                         FROM documents
                                         WHERE user_id = $1
                                            AND in_trash = false
                                         ORDER BY modified_at DESC`, [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('/api/private/loaddocuments error: ', error);
        res.status(400).json({ error: 'Cannot load documents on dashboard' });
    }
});

app.get('/api/private/searchdashboard', async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, doc_id, title, modified_at
                                         FROM documents
                                         WHERE user_id = $1
                                            AND title ILIKE $2
                                         ORDER BY modified_at DESC`, [req.user.id, `%${req.query.searchquery}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('/api/private/searchdashboard error: ', error);
        res.status(400).json({ error: 'Failed search query' });
    }
});

app.post('/api/private/createdocument', async (req, res) => {
    try {
        const uuid = crypto.randomUUID();
        const result = await pool.query(`INSERT INTO documents (user_id, doc_id)
                                           VALUES ($1, $2)
                                           RETURNING doc_id`, [req.user.id, uuid]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('/api/private/createdocument error: ', error);
        res.status(400).json({ error: 'Error in creating document' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const id = await loginUser(req.body.email, req.body.password, res);
        createJWT(id, res);
        res.status(201).json({ success: 'Login success' });
    } catch (error) {
        console.error('/api/login error: ', error);
        res.status(500).json({ error: 'Login error' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const id = await registerUser(req.body.email, req.body.password, res);
        createJWT(id, res);
        res.status(201).json({ success: 'Registration success' });
    } catch (error) {
        console.error('/api/register error: ', error);
        res.status(500).json({ error: 'Registration error' });
    }
});

app.post('/api/logoutuser', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    });
    res.status(200).json({ success: 'Logged out user and cleared cookie' });
});

app.post('/api/private/submitverificationcode', async (req, res) => {
    try {
        const isValidVerificationCode = await pool.query(`SELECT EXISTS (
                                                          SELECT 1
                                                          FROM verification_codes
                                                          WHERE user_id = $1 
                                                            AND verification_code = $2 
                                                            AND NOW() < expires_at)`, [req.user.id, req.body.verificationCode]);
        if (!isValidVerificationCode.rows[0].exists) {
            res.status(422).json({ error: 'Invalid verification code' });
            return;
        }
        pool.query(`UPDATE users
                    SET is_verified = true
                    WHERE id = $1`, [req.user.id]);
        res.status(200).json({ success: 'Code is verified' });
    } catch (error) {
        console.error('/api/private/submitverificationcode error: ', error);
        res.status(400).json({ error: 'Error in submitting verification code' });
    }
});

app.patch('/api/private/autosavedocument/:doc_id', (req, res) => {
    try {
        pool.query(`UPDATE documents
                    SET body = $1
                    WHERE doc_id = $2
                        AND user_id = $3`, [req.body.body, req.params.doc_id, req.user.id]);
        res.status(200).json({ success: 'Auto saved document' });
    } catch (error) {
        console.error('/api/private/autosavedocument/:doc_id error: ', error);
        res.status(400).json({ error: 'Could not autosave' });
    }
});

app.patch('/api/private/changeemail', async (req, res) => {
    try {
        const emailExists = await pool.query(`SELECT EXISTS (
                                              SELECT 1
                                              FROM users
                                              WHERE email = $1)`, [req.body.email]);
        if (emailExists.rows[0].exists) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        pool.query(`UPDATE users
                    SET email = $1,
                        is_verified = false
                    WHERE id = $2`, [req.body.email, req.user.id]);
        res.status(200).json({ success: 'Updated email' });
    } catch (error) {
        console.error('/api/private/changeemail error: ', error);
        res.status(400).json({ error: 'Failed to change email' });
    }
});

app.patch('/api/private/changepassword', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        pool.query(`UPDATE users
                    SET password_hash = $1
                    WHERE id = $2`, [hashedPassword, req.user.id]);
        res.status(200).json({ success: 'Changed password' });
    } catch (error) {
        console.error('/api/private/changepassword error: ', error);
        res.status(400).json({ error: 'Failed to change password' });
    }
});

app.patch('/api/private/verifyaccount', async (req, res) => {
    try {
        const email = await pool.query(`SELECT email
                                        FROM users
                                        WHERE id = $1`, [req.user.id]);
        sendVerificationCode(email.rows[0].email, req);
        res.status(200).json({ success: 'Sent verification code' });
    } catch (error) {
        console.error('/api/private/verifyaccount error: ', error);
        res.status(400).json({ error: 'Unable to send verification code' });
    }
});

app.patch('/api/private/renamedocument/:documentId', (req, res) => {
    try {
        pool.query(`UPDATE documents
                    SET title = $1
                    WHERE user_id = $2
                        AND doc_id = $3`, [req.body.newTitle, req.user.id, req.params.documentId]);
        res.status(200).json({ success: 'Updated title' });
    } catch (error) {
        console.error('/api/private/renamedocument error: ', error);
        res.status(400).json({ error: 'Cannnot rename document' });
    }
});

app.patch('/api/private/updatemodifiedat/:documentId', (req, res) => {
    try {
        pool.query(`UPDATE documents
                    SET modified_at = NOW()
                    WHERE user_id = $1
                        AND doc_id = $2`, [req.user.id, req.params.documentId]);
        res.status(200).json({ success: 'Changed date modified' });
    } catch (error) {
        console.error('/api/private/modifiedat/:documentId error: ', error);
        res.status(400).json({ error: 'Cannot change modified_at date' });
    }
});

app.delete('/api/private/removedocument/:documentId', (req, res) => {
    try {
        pool.query(`UPDATE documents
                    SET in_trash = true
                    WHERE user_id = $1
                        AND doc_id = $2`, [req.user.id, req.params.documentId]);
        res.status(204).json({ success: 'Removed document' });
    } catch (error) {
        console.error('/api/private/removedocument/:documentId error: ', error);
        res.status(400).json({ error: 'Could not remove document' });
    }
});

const verifyUser = (req) => {
    const token = req.headers.cookie.split('=')[1];
    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.user = decoded;
}

const loginUser = async (email, password, res) => {
    const emailExists = await pool.query(`SELECT EXISTS (
                                     SELECT 1
                                     FROM users
                                     WHERE email = $1)`, [email]);
    if (!emailExists.rows[0].exists) {
        res.status(404).json({ error: 'Email not found' });
        return;
    }

    const hashedPassword = await pool.query(`SELECT password_hash
                                             FROM users
                                             WHERE email = $1`, [email]);
    const passwordMatch = await bcrypt.compare(password, hashedPassword.rows[0].password_hash);
    
    if (!passwordMatch) {
        res.status(401).json({ error: 'Incorrect password' });
        return;
    }
    
    const id = await pool.query(`SELECT id
                                 FROM users
                                 WHERE email = $1`, [email]);

    return id.rows[0].id;
}

const registerUser = async (email, password, res) => {
    const emailExists = await pool.query(`SELECT EXISTS (
                                        SELECT 1
                                        FROM users
                                        WHERE email = $1)`, [email]);
    if (emailExists.rows[0].exists) {
        res.status(409).json({ error: 'Email already registered' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`INSERT INTO users (email, password_hash)
                                 VALUES ($1, $2)
                                 RETURNING id`, [email, hashedPassword]);
    return result.rows[0].id;
}

const createJWT = (id, res) => {
    const token = jwt.sign({ id: id }, process.env.SECRET_JWT_KEY, { expiresIn: '1h' });
    res.cookie('token', token, {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    });
}

const sendVerificationCode = (email, req) => {
    const verificationCode = Math.floor(Math.random() * 1000000);

    transporter.sendMail({
        from: '"Sir Blazing" <turkeytype@babyoil.com>',
        to: `${email}`,
        subject: 'Verification code',
        text: `Your code is bitch ${verificationCode}`,
        html: `<p>Your code is <strong>${verificationCode}</strong></p>`
    });

    pool.query(`INSERT INTO verification_codes (verification_code, user_id)
                VALUES ($1, $2)`, [verificationCode, req.user.id]);
}

app.listen(3000, () => console.log('Server is running at port 3000'));