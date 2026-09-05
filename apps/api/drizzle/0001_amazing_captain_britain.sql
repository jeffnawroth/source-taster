CREATE TABLE "user_ai_secrets" (
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"ciphertext" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_ai_secrets_user_id_provider_pk" PRIMARY KEY("user_id","provider")
);
