import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('@Public', () => {
  @Public()
  class PublicRoutes {}

  class GuardedRoutes {}

  it('should be marked as public', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, PublicRoutes);

    expect(isPublic).toBe(true);
  });

  it('should not be marked as public', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, GuardedRoutes);

    expect(isPublic).toBe(undefined);
  });
});
