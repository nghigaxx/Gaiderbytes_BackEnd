/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('coach_applications', (table) => {
            table.increments('id').primary();
            table.string('first_name', 255).notNullable();
            table.string('last_name', 255).notNullable();
            table.string('email', 255).unique().notNullable();
            table.string('province', 255);
            table.string('city', 255);
            table.string('address', 255);
            table.string('postal_code', 10);
            table.date('date_of_birth');
            table.string('pronoun', 255);
            table.integer('years_of_experience');
            table.string('resume_url', 255);
            table.text('self_identification');
            table.string('gen_status', 255);
            table.text('languages');
            table.text('institutions');
            table.text('availability');
            table.text('introduction');
            table.boolean('reside_in_canada');
            table.boolean('post_secondary_exp');
            table.string('status', 255).defaultTo('pending');
            table.string('post_secondary_program', 255);
            table.bigInteger('verification_code').unsigned();
        })
        .createTable('student_applications', (table) => {
            table.increments('id').primary();
            table.string('first_name', 50).notNullable();
            table.string('last_name', 50).notNullable();
            table.string('email', 100).notNullable();
            table.string('province', 50).notNullable();
            table.string('city', 50).notNullable();
            table.string('address', 100).notNullable();
            table.string('postal_code', 20).notNullable();
            table.date('date_of_birth').notNullable();
            table.string('pronoun', 20).notNullable();
            table.string('institution_name', 100).notNullable();
            table.string('program_name', 100).notNullable();
            table.string('emergency_contact_first_name', 50).notNullable();
            table.string('emergency_contact_last_name', 50).notNullable();
            table.string('emergency_contact_phone', 20).notNullable();
            table.string('emergency_contact_relation', 50).notNullable();
            table.string('status', 20).defaultTo('pending');
            table.integer('coach_id').unsigned().references('id').inTable('coach_applications').onDelete('SET NULL');
            table.bigInteger('verification_code').unsigned();
        })
        .createTable('admins', (table) => {
            table.increments('id').primary();
            table.string('username', 255).unique().notNullable();
            table.string('password', 255).notNullable();
        })
        .then(() => {
            return knex.schema.raw('ALTER TABLE coach_applications ADD CONSTRAINT SixDigits CHECK (verification_code BETWEEN 100000 AND 999999)');
        })
        .then(() => {
            return knex.schema.raw('ALTER TABLE student_applications ADD CONSTRAINT SixDigits CHECK (verification_code BETWEEN 100000 AND 999999)');
        })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
