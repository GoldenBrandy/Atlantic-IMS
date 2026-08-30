-- database/migrations/006_create_user_groups.sql

CREATE TABLE IF NOT EXISTS user_groups (
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,

    PRIMARY KEY (user_id, group_id),

    CONSTRAINT fk_user_groups_user
        FOREIGN KEY (user_id)
        REFERENCES users (id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_user_groups_group
        FOREIGN KEY (group_id)
        REFERENCES groups (group_id) 
        ON DELETE CASCADE
);
