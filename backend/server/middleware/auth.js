"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const supabase_1 = require("../../src/lib/supabase");
async function isAdmin(req, res, next) {
    try {
        // Get the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No authorization header" });
        }
        // Extract the token
        const token = authHeader.replace("Bearer ", "");
        // Verify the token and get the user
        const { data: { user }, error, } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: "Invalid token" });
        }
        // Check if user has admin role
        const { data: roles, error: rolesError } = await supabase_1.supabase
            .from("user_roles")
            .select("role_id")
            .eq("user_id", user.id)
            .single();
        if (rolesError || !roles) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        // Verify the role is admin
        const { data: roleType, error: roleTypeError } = await supabase_1.supabase
            .from("role_types")
            .select("name")
            .eq("id", roles.role_id)
            .single();
        if (roleTypeError || !roleType || roleType.name !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        // Add user to request for use in route handlers
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
