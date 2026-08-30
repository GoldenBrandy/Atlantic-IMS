import { useEffect, useMemo, useState } from 'react';
import { Select } from "@/shared";
import { getGroups } from "@/features/access/services/groupService";
import { getGroupPermissions, getUserPermissions } from "@/features/access/services/permissionService";
import { getUsers, formatUserName } from "@/features/users/services/userService";

export default function AccessSidebar({
    selectedGroup,
    setSelectedGroup,
    setSelectedGroupName,
    setGroupPermissions,
    selectedUser,
    setSelectedUser,
    setSelectedUserName,
    setUserPermissions,
}) {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getGroups()
            .then((data) => setGroups(Array.isArray(data) ? data : []))
            .catch(console.error);

        getUsers()
            .then((data) => setUsers(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    const groupOptions = useMemo(
        () => [
            { value: "", label: "Seleccione una opción" },
            ...groups.map((group) => ({
                value: String(group.group_id),
                label: group.group_name,
            }))
        ],
        [groups],
    );

    const userOptions = useMemo(
        () => [
            { value: "", label: "Seleccione una opción" },
            ...users.map((user) => ({
                value: String(user.id),
                label: formatUserName(user),
            })),
        ],
        [users],
    );

    const selectClassName = "h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-500 shadow-sm outline-none transition focus:border-slate-500 focus:ring-0";

    const handleGroupChange = async (event) => {
        const groupId = event.target.value;
        const selectedGroupData = groups.find((group) => String(group.group_id) === groupId);
        setSelectedGroup(groupId);
        setSelectedGroupName(selectedGroupData?.group_name ?? "");
        setSelectedUser("");
        setSelectedUserName("");
        setUserPermissions([]);
        if (!groupId) {
            setGroupPermissions([]);
            return;
        }

        try {
            const permissions = await getGroupPermissions(groupId);
            setGroupPermissions(Array.isArray(permissions) ? permissions : []);
        } catch (error) {
            console.error(error);
            setGroupPermissions([]);
        }
    };

    const handleUserChange = async (event) => {
        const userId = event.target.value;
        const selectedUserData = users.find((user) => String(user.id) === userId);
        setSelectedUser(userId);
        setSelectedUserName(selectedUserData ? formatUserName(selectedUserData) : "");
        setSelectedGroup("");
        setSelectedGroupName("");
        setGroupPermissions([]);
        if (!userId) {
            setUserPermissions([]);
            return;
        }

        try {
            const permissions = await getUserPermissions(userId);
            setUserPermissions(Array.isArray(permissions) ? permissions : []);
        } catch (error) {
            console.error(error);
            setUserPermissions([]);
        }
    };

    return (
        <aside className='min-w-0 space-y-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'>
            <section>
                <h2 className='mb-3 text-lg font-semibold text-slate-800'>Grupos Usuarios</h2>
                <Select name="groupId" value={selectedGroup} onChange={handleGroupChange} options={groupOptions} className={selectClassName} />
            </section>
            <section>
                <h2 className='mb-3 text-lg font-semibold text-slate-800'>Usuario Individual</h2>
                <Select name="userId" value={selectedUser} onChange={handleUserChange} options={userOptions} className={selectClassName} />
            </section>
        </aside>
    );
}
