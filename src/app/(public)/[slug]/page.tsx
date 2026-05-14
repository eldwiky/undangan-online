import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import InvitationClient from "./InvitationClient";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface InvitationPageProps {
  params: Promise<{ slug: string }>;
}

async function getInvitationBySlug(slug: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      gallery: {
        orderBy: { order: "asc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
      },
      giftAccounts: true,
      loveStories: {
        orderBy: { order: "asc" },
      },
    },
  });

  return invitation;
}

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    return {
      title: "Undangan Tidak Ditemukan",
    };
  }

  const title = `${invitation.groomName} & ${invitation.brideName} - Undangan Pernikahan`;
  const description = invitation.description || `Undangan pernikahan ${invitation.groomName} & ${invitation.brideName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: invitation.ogImage ? [{ url: invitation.ogImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: invitation.ogImage ? [invitation.ogImage] : [],
    },
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  // Serialize dates for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedInvitation = JSON.parse(JSON.stringify(invitation)) as any;

  return <InvitationClient invitation={serializedInvitation} />;
}
