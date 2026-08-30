// backend/src/features/permissions/permissions.service.js

import { permissionsRepository } from "./permissions.repository.js";

export const permissionsService = {
    async getAll() {
        return await permissionsRepository.getAll();
    }
};

// despues del servicio sigue configurar el controlador, que es donde se manejan las solicitudes HTTP y se llama al servicio para obtener los datos y enviarlos como respuesta.

// La diferencia entre HTTP y HTTPS es que HTTPS es la versión segura de HTTP, que utiliza cifrado SSL/TLS para proteger la comunicación entre el cliente y el servidor. Esto significa que los datos enviados a través de HTTPS están encriptados y no pueden ser interceptados o modificados por terceros, mientras que los datos enviados a través de HTTP no están protegidos y pueden ser vulnerables a ataques de intermediarios. 