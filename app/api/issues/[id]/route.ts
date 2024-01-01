import { issueSchema, patchIssueSchema } from "@/app/validationSchemas";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import authOptions from "@/app/auth/authOptions";
import { getServerSession } from "next-auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({}, { status: 401 });

    const body = await request.json();

    const validate = patchIssueSchema.safeParse(body)
    if (!validate.success)
        return NextResponse.json(validate.error.format(), { status: 400 })

    const { assignedToUserId, description, title } = body;

    if (assignedToUserId) {
        const user = await prisma.user.findUnique({ where: { id: assignedToUserId } })
        if (!user)
            return NextResponse.json({ error: "Invalid user" }, { status: 404 })
    }

    const issue = await prisma.issue.findUnique({ where: { id: parseInt(params.id) } })
    if (!issue) return NextResponse.json({ error: "Invalid issue" }, { status: 404 })

    const updatedIssue = await prisma.issue.update({
        where: { id: issue.id },
        data: {
            title,
            description,
            assignedToUserId
        }
    })

    return NextResponse.json(updatedIssue)

}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({}, { status: 401 });

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    })

    if (!issue) return NextResponse.json({ error: "Invalid issue" }, { status: 404 })

    await prisma.issue.delete({
        where: { id: issue.id }
    })

    return NextResponse.json({})
}