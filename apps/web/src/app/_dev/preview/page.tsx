/**
 * Design reference: shows UI primitives and `data-slot` selectors.
 * Visit at /_dev/preview (no auth wall, dev-only).
 */
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  RadioGroup,
  RadioItem,
  Checkbox,
  ProgressBar,
  Spinner,
} from "@shotwise/ui-primitives";

const SLOTS = [
  // Marketing
  "marketing-nav", "marketing-footer", "marketing-main",
  "hero", "hero-title", "hero-accent", "hero-subtitle", "hero-cta",
  "how-it-works", "how-step", "features-grid", "cta",
  // Pricing
  "pricing", "plan-card", "faq",
  // App shell
  "app-shell", "app-sidebar", "app-logo", "app-nav", "app-main", "app-topbar", "app-content",
  "credit-balance",
  // Dashboard
  "dashboard", "empty-state", "project-list",
  // Project detail
  "project-detail", "project-screenshots",
  // Editor
  "editor-shell", "editor-list", "editor-canvas", "editor-settings",
  "screenshot-list", "screenshot-list-item",
  "settings-panel",
  "live-preview", "pixel-preview",
  // Studio
  "studio-shell", "studio-gallery", "studio-canvas", "studio-inspector",
  "template-card", "locale-checks", "device-checks",
  // Account
  "account-page",
  // Primitives
  "button", "input", "textarea", "label", "card", "card-header", "card-title", "card-body", "card-footer",
  "dialog-overlay", "dialog-content", "dialog-title", "dialog-description",
  "tabs-list", "tabs-trigger", "tabs-content",
  "radio-group", "radio-item", "checkbox",
  "select-trigger", "select-content", "select-item",
  "slider", "progress", "spinner",
  "dropzone", "dropzone-default",
  "toast", "toast-viewport",
];

export default function DevPreviewPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Design hand-off preview</h1>
      <p style={{ color: "var(--muted-fg)" }}>
        Every UI primitive Shotwise uses. Each container carries{" "}
        <code>data-slot</code> so design CSS can override placeholder Tailwind classes.
      </p>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading…</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Inputs</h2>
        <Label>Label</Label>
        <Input placeholder="Input" />
        <Label style={{ marginTop: "0.6rem" }}>Textarea</Label>
        <Textarea placeholder="Textarea" />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Card</h2>
        <Card>
          <CardHeader><CardTitle>Card title</CardTitle></CardHeader>
          <CardBody>Card body content</CardBody>
          <CardFooter>Card footer</CardFooter>
        </Card>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Tabs</h2>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Tab A content</TabsContent>
          <TabsContent value="b">Tab B content</TabsContent>
        </Tabs>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Choice controls</h2>
        <RadioGroup defaultValue="a">
          <label style={{ display: "flex", gap: "0.4rem" }}><RadioItem value="a" /> A</label>
          <label style={{ display: "flex", gap: "0.4rem" }}><RadioItem value="b" /> B</label>
        </RadioGroup>
        <label style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
          <Checkbox defaultChecked /> Checked checkbox
        </label>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Progress</h2>
        <ProgressBar value={45} />
        <p style={{ marginTop: "0.6rem" }}>
          <Spinner /> Loading
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>data-slot inventory</h2>
        <p style={{ color: "var(--muted-fg)" }}>
          Use these selectors in your design CSS, e.g. <code>[data-slot=&quot;hero&quot;] {`{ ... }`}</code>.
        </p>
        <ul style={{ columns: 2, fontFamily: "monospace", fontSize: "0.85rem", color: "var(--muted-fg)" }}>
          {SLOTS.map((slot) => (
            <li key={slot}>{slot}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
