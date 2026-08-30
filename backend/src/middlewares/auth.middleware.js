import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Token requerido',
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Token invalido',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token invalido o expirado',
        });
    }
};

// Solo permite continuar si el usuario autenticado es super administrador.
// Debe usarse siempre despues de authenticateToken (necesita req.user).
export const requireSuperUser = (req, res, next) => {
    if (!req.user?.isSuperUser) {
        return res.status(403).json({
            message: 'Solo un super administrador puede realizar esta accion',
        });
    }
    next();
};

// Solo permite continuar si el usuario autenticado es el dueño del recurso
// (:id en la ruta). Debe usarse siempre despues de authenticateToken.
export const requireOwnUser = (req, res, next) => {
    if (Number(req.user?.id) !== Number(req.params.id)) {
        return res.status(403).json({
            message: 'Solo puedes realizar esta accion sobre tu propia cuenta',
        });
    }
    next();
};