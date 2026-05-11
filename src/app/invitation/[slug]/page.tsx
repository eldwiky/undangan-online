import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import InvitationClient from "./InvitationClient";

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

  return {
    title: `${invitation.groomName} & ${invitation.brideName} - Undangan Pernikahan`,
    description:
      invitation.description ||
      `Undangan pernikahan ${invitation.groomName} & ${invitation.brideName}`,
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  // Serialize dates for client component
  const serializedInvitation = {
    ...invitation,
    eventDate: invitation.eventDate.toISOString(),
    akadDate: invitation.akadDate?.toISOString() || null,
    resepsiDate: invitation.resepsiDate?.toISOString() || null,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
    gallery: invitation.gallery.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    comments: invitation.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
    giftAccounts: invitation.giftAccounts.map((account) => ({
      ...account,
      createdAt: account.createdAt.toISOString(),
    })),
    loveStories: invitation.loveStories.map((story) => ({
      ...story,
      createdAt: story.createdAt.toISOString(),
    })),
  };

  return <InvitationClient invitation={serializedInvitation} />;
}
