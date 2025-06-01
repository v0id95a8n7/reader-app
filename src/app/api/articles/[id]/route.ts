import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '~/utils/auth';
import { db } from '~/server/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const article = await db.savedArticle.findUnique({
      where: { id },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    if (article.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this article' },
        { status: 403 }
      );
    }
    
    await db.savedArticle.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 