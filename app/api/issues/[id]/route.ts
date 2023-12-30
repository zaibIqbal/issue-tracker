import { issueSchema } from "@/app/validationSchemas";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();

    const validate = issueSchema.safeParse(body)
    if (!validate.success)
        return NextResponse.json(validate.error.format(), { status: 400 })

    const issue = await prisma.issue.findUnique({ where: { id: parseInt(params.id) } })
    if (!issue) return NextResponse.json({ error: "Invalid issue" }, { status: 404 })

    const updatedIssue = await prisma.issue.update({
        where: { id: issue.id },
        data: {
            title: body.title,
            description: body.description
        }
    })

    return NextResponse.json(updatedIssue)

}