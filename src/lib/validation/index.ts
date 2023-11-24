import * as z from "zod";

//  verileri daha sonra yeniden kullanabileceğimiz ve yönetebileceğimiz bir bileşene dönüştürmek için burası

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır." }),
  username: z.string().min(2, { message: "Kullanıcı adı en az 2 karakter olmalıdır." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Parola en az 8 karakter olmalıdır." }),
});
