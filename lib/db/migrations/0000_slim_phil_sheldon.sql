CREATE TABLE "tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"genre" text NOT NULL,
	"duration" text NOT NULL,
	"description" text NOT NULL,
	"image_path" text,
	"audio_path" text,
	"soundcloud_url" text,
	"has_listen" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poems" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"src" text NOT NULL,
	"caption" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "touch_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"image_path" text,
	"link_url" text,
	"content" text DEFAULT '[]' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sense_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text,
	"location" text,
	"description" text,
	"image_path" text,
	"link_url" text,
	"content" text DEFAULT '[]' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "start_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"artist_name" text DEFAULT 'Pearl Vulkan' NOT NULL,
	"quote" text DEFAULT 'There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape.' NOT NULL,
	"tagline" text DEFAULT 'Enter. Slowly.' NOT NULL,
	"background_image" text,
	"bg_opacity" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
