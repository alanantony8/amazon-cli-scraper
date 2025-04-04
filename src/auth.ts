import { chromium, Page } from 'playwright';
import dotenv from 'dotenv';
import inquirer from 'inquirer';

dotenv.config();

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  // Do any cleanup here (e.g., close DB, kill browser, etc.)
  process.exit(0); // Exit the process
});
/**
 * Logs into Amazon and handles MFA manually.
 */
// export async function loginToAmazon(page: Page, username: string, password: string) {
//   const AMAZON_HOME_URL = 'https://www.amazon.in/';
//   const browser = await chromium.launch({ headless: false });

//   const context = await browser.newContext({
//     // storageState: 'amazon-auth.json' // Load session if available
//   });

//   await page.goto(AMAZON_HOME_URL);


//   // 🔹 Step 2: Click on "Sign In" Button (Located in the navbar)
//   await page.click('#nav-link-accountList'); // Amazon's sign-in button

//   // 🔹 Step 3: Check if Already Logged In
//   if (page.url().includes('signin')) {
//     console.log('🔄 Logging in...');

//     // 🔹 Enter Email
//     await page.fill('input[name="email"]', username || '');
//     await page.click('input[type="submit"]');

//     // 🔹 Enter Password
//     await page.waitForSelector('input[name="password"]', { timeout: 5000 });
//     await page.fill('input[name="password"]', password || '');
//     await page.click('input#signInSubmit');

//     // 🔥 Handle MFA (if applicable)
//     if (await page.waitForSelector('input[name="otpCode"]')) {

//       console.log('🔐 MFA Detected! Asking for OTP...');

//       // 🟡 Prompt user for OTP
//       const { otp } = await inquirer.prompt([
//         {
//           type: 'input',
//           name: 'otp',
//           message: 'Enter the OTP sent to your registered device:',
//           validate: (val: string) => /^\d{6}$/.test(val) ? true : 'Enter a 6-digit OTP',
//         }
//       ]);

//       // Fill OTP (handle both input types)
//       if (await page.$('input[name="otpCode"]')) {
//         await page.fill('input[name="otpCode"]', otp);
//         await page.click('input#auth-signin-button');
//       } else {
//         await page.fill('input#auth-mfa-otpcode', otp);
//       }

//       // Click verify or continue
//       // if (await page.$('input#auth-signin-button')) {
//       //   await page.click('input#auth-signin-button');
//       // } else if (await page.$('input[type="submit"]')) {
//       //   await page.click('input[type="submit"]');
//       // }

//     }

//     console.log('✅ Login successful!');

//     // 🔹 Save session to avoid login in future runs
//     await context.storageState({ path: 'amazon-auth.json' });
//   } else {
//     console.log('✅ Already logged in, skipping login process');
//   }

//   const errorEl = await page.$('.a-alert-content');
//   if (errorEl) {
//     const errorText = await errorEl.textContent();
//     console.log(`❌ OTP Error: ${errorText?.trim()}`);
//   } else {
//     console.log('✅ OTP accepted, continuing...');
//   }
  
//   console.log('✅ Login Successful!');
//   return true;
// }



export async function loginToAmazon(page: Page, username: string, password: string): Promise<boolean> {
  const AMAZON_HOME_URL = 'https://www.amazon.in/';
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  // page = await context.newPage();

  await page.goto(AMAZON_HOME_URL);

  // 🔹 Click on "Sign In"
  await page.click('#nav-link-accountList');

  // 🔹 Login process starts
  if (page.url().includes('signin')) {
    console.log('🔄 Logging in...');

    await page.fill('input[name="email"]', username);
    await page.click('input[type="submit"]');

    await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    await page.fill('input[name="password"]', password);
    await page.click('input#signInSubmit');

    // 🔐 Handle OTP (MFA)
    const otpField = await page.waitForSelector('input[name="otpCode"], input#auth-mfa-otpcode', { timeout: 5000 }).catch(() => null);
    
    if (otpField) {
      console.log('🔐 MFA Detected! Asking for OTP...');

      const { otp } = await inquirer.prompt([
        {
          type: 'input',
          name: 'otp',
          message: 'Enter the OTP sent to your device:',
          validate: (val: string) => /^\d{6}$/.test(val) ? true : 'Enter a valid 6-digit OTP',
        }
      ]);

      if (await page.$('input[name="otpCode"]')) {
        await page.fill('input[name="otpCode"]', otp);
        await page.click('input#auth-signin-button');
      } else if (await page.$('input#auth-mfa-otpcode')) {
        await page.fill('input#auth-mfa-otpcode', otp);
        await page.click('input[type="submit"]');
      }

      // 🧪 Wait & Check for OTP error
      await page.waitForTimeout(3000);
      const errorEl = await page.$('.a-alert-content');
      if (errorEl) {
        const errorText = await errorEl.textContent();
        console.log(`❌ OTP Error: ${errorText?.trim()}`);
        console.log('🚫 Login failed due to invalid OTP.');
        // await browser.close();
        return false;
      }
    }

    // ✅ Final login check — look for a post-login element like user nav or orders
    const isLoggedIn = await page.$('#nav-orders') || await page.$('#nav-link-accountList-nav-line-1');
    if (isLoggedIn) {
      console.log('✅ Logged in successfully!');
      await context.storageState({ path: 'amazon-auth.json' });
      return true;
    } else {
      console.log('❌ Login failed after OTP (or unknown error).');
      // await browser.close();
      return false;
    }
  } else {
    console.log('✅ Already logged in, skipping login.');
    return true;
  }
}