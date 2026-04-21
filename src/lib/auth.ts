import jwt from 'jsonwebtoken'


const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface AuthContext {
  userId: string
  email: string
  role: string
}

export function verifyToken(request: Request): AuthContext | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthContext
    return decoded
  } catch {
    return null
  }
}

export function requireAuth(request: Request): AuthContext | NextResponse {
  const auth = verifyToken(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return auth
}

export function requireAdmin(request: Request): AuthContext | NextResponse {
  const auth = verifyToken(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }
  return auth
}
