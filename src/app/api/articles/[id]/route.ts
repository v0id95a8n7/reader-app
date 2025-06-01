import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '~/utils/auth';

const prisma = new PrismaClient();

interface Context {
  params: {
    id: string;
  };
}


export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    
    
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    
    const article = await prisma.savedArticle.findUnique({
      where: { id },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    if (article.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this article' },
        { status: 403 }
      );
    }
    
    
    await prisma.savedArticle.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 