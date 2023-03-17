import loginSchema from './loginSchema';

const validObj = {
  email: 'fabien@alilo.fr',
  password: 'mon.M0t_2-Pass',
};

describe('loginSchema', () => {
  const validateSyncError = (obj: any) => {
    let error: any;
    try {
      loginSchema.validateSync(obj);
    } catch (err) {
      error = err;
    }
    return error;
  };

  /**
   *
   */
  it('should be false with empty objet', async () => {
    expect(loginSchema.isValidSync({})).toBe(false);
  });

  it('should be true with valid objet', async () => {
    expect(loginSchema.isValidSync(validObj)).toBe(true);
  });

  it('should be true with valid objet with more props', async () => {
    expect(loginSchema.isValidSync({ ...validObj, name: 'jean jean', age: 35 })).toBe(true);
  });

  /**
   * email
   */
  it('should return an error with undefined email', async () => {
    const error: any = validateSyncError({ ...validObj, email: undefined });
    expect(error).toBeDefined();
    expect(error.path).toBe('email');
    expect(error.message).toBe('mixed.required');
  });

  it('should return an error with empty email', async () => {
    const error: any = validateSyncError({ ...validObj, email: '' });
    expect(error).toBeDefined();
    expect(error.path).toBe('email');
    expect(error.message).toBe('mixed.required');
  });

  it('should return an error with bad email', async () => {
    const error: any = validateSyncError({ ...validObj, email: 'fabien' });
    expect(error).toBeDefined();
    expect(error.path).toBe('email');
    expect(error.message).toBe('string.email');
  });

  /**
   * password
   */
  it('should return an error with undefined password', async () => {
    const error: any = validateSyncError({ ...validObj, password: undefined });
    expect(error).toBeDefined();
    expect(error.path).toBe('password');
    expect(error.message).toBe('mixed.required');
  });

  it('should return an error with empty password', async () => {
    const error: any = validateSyncError({ ...validObj, password: '' });
    expect(error).toBeDefined();
    expect(error.path).toBe('password');
    expect(error.message).toBe('mixed.required');
  });
});
