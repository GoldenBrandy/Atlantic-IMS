import { accessRepository } from './access.repository.js';

export const accessService = {
    async hasPermission(userId, permissionCode) {
        const isSuperUser = await accessRepository.isSuperUser(userId);

        if (isSuperUser) {
            return true;
        }

        const userPermissions = await accessRepository.getUserPermissions(userId);

        return userPermissions.includes(permissionCode);
    }
};