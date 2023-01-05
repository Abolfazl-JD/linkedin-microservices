import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1672927510129 implements MigrationInterface {
    name = 'CreateTables1672927510129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feeds" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "PK_3dafbf766ecbb1eb2017732153f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "conversationId" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "lastUpdate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "emailIsConfirmed" boolean NOT NULL DEFAULT false, "password" character varying NOT NULL, "hashedRefreshToken" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "imagePath" character varying, "clientId" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "connection_requests" ("id" SERIAL NOT NULL, "status" "public"."connection_requests_status_enum" NOT NULL DEFAULT 'pending', "senderId" integer, "recieverId" integer, CONSTRAINT "PK_a10611f5c871549e66b94f9f252" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations_users_users" ("conversationsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_a63b369afba67e6ef69445136fb" PRIMARY KEY ("conversationsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_35bd28a66d1a6e3eefa386815e" ON "conversations_users_users" ("conversationsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc56bf8e5f76472688210e9a99" ON "conversations_users_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "feeds" ADD CONSTRAINT "FK_a1a01eb30c28276a21b04b59552" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connection_requests" ADD CONSTRAINT "FK_9dc6c9440a8459424b8cad034f3" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connection_requests" ADD CONSTRAINT "FK_d132afeadcd63b63ddb75bde96a" FOREIGN KEY ("recieverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations_users_users" ADD CONSTRAINT "FK_35bd28a66d1a6e3eefa386815e8" FOREIGN KEY ("conversationsId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversations_users_users" ADD CONSTRAINT "FK_bc56bf8e5f76472688210e9a996" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversations_users_users" DROP CONSTRAINT "FK_bc56bf8e5f76472688210e9a996"`);
        await queryRunner.query(`ALTER TABLE "conversations_users_users" DROP CONSTRAINT "FK_35bd28a66d1a6e3eefa386815e8"`);
        await queryRunner.query(`ALTER TABLE "connection_requests" DROP CONSTRAINT "FK_d132afeadcd63b63ddb75bde96a"`);
        await queryRunner.query(`ALTER TABLE "connection_requests" DROP CONSTRAINT "FK_9dc6c9440a8459424b8cad034f3"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646"`);
        await queryRunner.query(`ALTER TABLE "feeds" DROP CONSTRAINT "FK_a1a01eb30c28276a21b04b59552"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc56bf8e5f76472688210e9a99"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35bd28a66d1a6e3eefa386815e"`);
        await queryRunner.query(`DROP TABLE "conversations_users_users"`);
        await queryRunner.query(`DROP TABLE "connection_requests"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "feeds"`);
    }

}
