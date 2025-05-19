/**
 * Theme service for managing system theme
 */
export class ThemeService {
  private static instance: ThemeService;
  private readonly THEME_ATTRIBUTE = "data-theme";
  private readonly DARK_THEME = "dark";
  private readonly LIGHT_THEME = "light";

  private constructor() {
    this.initializeTheme();
    this.watchSystemTheme();
  }

  /**
   * Get singleton instance of ThemeService
   */
  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Initialize theme based on system preference
   */
  private initializeTheme(): void {
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    this.setTheme(isDarkMode ? this.DARK_THEME : this.LIGHT_THEME);
  }

  /**
   * Watch for system theme changes
   */
  private watchSystemTheme(): void {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        this.setTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
      });
  }

  /**
   * Set theme on document
   * @param theme - Theme to set ('dark' or 'light')
   */
  private setTheme(theme: string): void {
    document.documentElement.setAttribute(this.THEME_ATTRIBUTE, theme);
  }

  /**
   * Get current theme
   * @returns Current theme ('dark' or 'light')
   */
  public getCurrentTheme(): string {
    return (
      document.documentElement.getAttribute(this.THEME_ATTRIBUTE) ||
      this.LIGHT_THEME
    );
  }
}
