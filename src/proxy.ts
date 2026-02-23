import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // すべてのパスに適用（ただし、静的ファイルやAPIなどは適宜除外する）
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // 1. 環境変数から設定したIDとパスワードを取得
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PASSWORD;

  // もし環境変数が設定されていなければ、認証をスキップ（ローカル開発用）
  if (!user || !pwd) {
    return NextResponse.next();
  }

  // 2. 認証情報があるかチェック
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [providedUser, providedPwd] = atob(authValue).split(':');

    // 3. IDとパスワードが一致すれば通過
    if (providedUser === user && providedPwd === pwd) {
      return NextResponse.next();
    }
  }

  // 4. 一致しない、または認証情報がない場合は 401 (Unauthorized) を返し、ダイアログを出す
  url.pathname = '/api/auth';
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}