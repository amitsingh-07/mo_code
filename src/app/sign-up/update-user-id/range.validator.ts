

export function ValidateRange(control): { [key: string]: boolean } | null {
  const SINGAPORE_MOBILE_REGEXP = /^(8|9)\d{7}$/;
  if (!SINGAPORE_MOBILE_REGEXP.test(control.value)) { //Failed
    return { mobileRange: true };
  }
  //Success
  return null;
}
