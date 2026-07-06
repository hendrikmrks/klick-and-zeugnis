import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, birthDate, password } = body;

        if (!email || !firstName || !lastName || !birthDate || !password) {
            return NextResponse.json(
                { error: "Bitte fülle alle Felder aus." },
                { status: 400 }
            );
        }

        // Existiert E-Mail schon?
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Diese E-Mail ist bereits registriert." },
                { status: 400 }
            );
        }

        // Passwort hashen
        const hashedPassword = await hash(password, 12);

        // User speichern
        await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                birthDate: new Date(birthDate),
                passwordHash: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Erfolgreich registriert." });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Interner Serverfehler." },
            { status: 500 }
        );
    }
}
