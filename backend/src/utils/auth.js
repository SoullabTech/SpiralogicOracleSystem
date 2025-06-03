"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const supabase_1 = require("../lib/supabase");
async function isAdmin(userId) {
    try {
        // Check if user has admin role
        const { data: roles, error: rolesError } = await supabase_1.supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', userId)
            .single();
        if (rolesError || !roles) {
            return false;
        }
        // Verify the role is admin
        const { data: roleType, error: roleTypeError } = await supabase_1.supabase
            .from('role_types')
            .select('name')
            .eq('id', roles.role_id)
            .single();
        return !roleTypeError && roleType?.name === 'admin';
    }
    catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
