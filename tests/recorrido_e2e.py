"""Pruebas de extremo a extremo del formulario (las 12 del enunciado).
Uso: python3 recorrido.py <carpeta_repo> <carpeta_vendor> <carpeta_capturas> [sin-html]
Con 'sin-html' se quitan required, pattern, min, max y maxlength antes de cada prueba
(la "copia de prueba" del enunciado): las comprobaciones de JS deben seguir funcionando."""
import sys, subprocess, time, os, json
from playwright.sync_api import sync_playwright

REPO, VENDOR, CAPS = sys.argv[1], sys.argv[2], sys.argv[3]
SIN_HTML = len(sys.argv) > 4 and sys.argv[4] == "sin-html"
os.makedirs(CAPS, exist_ok=True)
PORT = 8765
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=REPO,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
BASE = f"http://localhost:{PORT}"
BS = f"{VENDOR}/bootstrap-5.3.3/package/dist"
BI = f"{VENDOR}/bootstrap-icons-1.11.3/package/font"

def cdn(route):
    u = route.request.url
    if u.endswith("bootstrap.min.css"): return route.fulfill(path=f"{BS}/css/bootstrap.min.css")
    if u.endswith("bootstrap.bundle.min.js"): return route.fulfill(path=f"{BS}/js/bootstrap.bundle.min.js")
    if "bootstrap-icons.min.css" in u: return route.fulfill(path=f"{BI}/bootstrap-icons.min.css")
    if "/fonts/bootstrap-icons" in u:
        name = u.split("/fonts/")[1].split("?")[0]
        return route.fulfill(path=f"{BI}/fonts/{name}")
    return route.abort()

resultados = []
def registrar(n, nombre, esperado, obtenido, ok):
    resultados.append({"n": n, "prueba": nombre, "esperado": esperado, "obtenido": obtenido, "ok": ok})
    print(("OK " if ok else "KO ") + f"{n}. {nombre}: {obtenido}")

errores_consola = []

def nueva(page):
    page.goto(f"{BASE}/contratacion.html")
    if SIN_HTML:
        page.evaluate("""document.querySelectorAll('[required],[pattern],[min],[max],[maxlength]').forEach(e=>{
          ['required','pattern','min','max','maxlength'].forEach(a=>e.removeAttribute(a)); if(e.type==='email'||e.type==='tel') e.type='text';});""")

foco = lambda p: p.evaluate("document.activeElement.id")
visible_paso = lambda p: p.evaluate("[...document.querySelectorAll('.paso')].find(f=>!f.hidden).dataset.paso")
err = lambda p, i: p.locator(f"#{i}-error").inner_text().strip() if p.locator(f"#{i}-error").is_visible() else ""
sig = lambda p: p.click("#btn-siguiente")

def datos_ok(p):
    p.fill("#nombre", "María José"); p.fill("#apellidos", "O'Connor Ruiz-Pérez")
    p.fill("#dni", "12345678Z"); p.fill("#nacimiento", "1995-04-12")
    p.fill("#email", "maria.prueba@correo.es"); p.fill("#email2", " MARIA.prueba@correo.es ")
    p.fill("#telefono", "+34 612 34 56 78")

def direccion_ok(p):
    p.select_option("#tipo-via", "Calle"); p.fill("#nombre-via", "Toro"); p.fill("#numero", "12")
    p.fill("#piso", "3º B"); p.fill("#cp", "37002"); p.fill("#localidad", "Salamanca"); p.select_option("#provincia", "37")

def hasta_paso(p, n, plan="plus", comps=()):
    if n >= 2:
        p.check(f"#plan-{plan}"); [p.check(f"#comp-{c}") for c in comps]; sig(p)
    if n >= 3: sig(p)
    if n >= 4: datos_ok(p); sig(p)
    if n >= 5: direccion_ok(p); sig(p)
    if n >= 6: p.check("#pago-domiciliacion"); p.fill("#titular-cuenta", "María José O'Connor"); p.fill("#iban", "ES91 2100 0418 4502 0005 1332"); sig(p)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1366, "height": 900})
    ctx.route("**/cdn.jsdelivr.net/**", cdn); ctx.route("**/cdnjs.cloudflare.com/**", cdn); ctx.route("**/fonts.googleapis.com/**", cdn)
    p = ctx.new_page()
    p.on("console", lambda m: errores_consola.append(m.text) if m.type == "error" else None)
    p.on("pageerror", lambda e: errores_consola.append(str(e)))

    # 1. Vacíos y espacios
    nueva(p); sig(p)
    a = foco(p) == "plan-basico" and p.is_visible("#resumen-errores") and visible_paso(p) == "1"
    hasta_paso(p, 3); p.fill("#nombre", "    "); sig(p)
    ok = a and foco(p) == "nombre" and visible_paso(p) == "3" and err(p, "nombre") == "Escribe tu nombre."
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/01-errores-paso3.png", full_page=True)
    registrar(1, "Vacíos y espacios", "No avanza y enfoca el primer campo obligatorio", f"foco en #{foco(p)} · «{err(p,'nombre')}»", ok)

    # 2. Correo y teléfono
    datos_ok(p); p.fill("#email", "maria.correo.es"); p.fill("#email2", "otra@correo.es"); p.fill("#telefono", "512345678"); sig(p)
    e1, e2, e3 = err(p, "email"), err(p, "email2"), err(p, "telefono")
    a = bool(e1) and bool(e3)
    p.fill("#email", "maria@correo.es"); sig(p); e2b = err(p, "email2")
    ok = a and bool(e2b) and "no coinciden" in e2b and foco(p) == "email2"
    registrar(2, "Correo y teléfono", "Detecta formato inválido y correos que no coinciden", f"«{e1}» · «{e2b}» · «{e3}»", ok)

    # 3. DNI
    datos_ok(p); p.fill("#dni", "12345678A"); sig(p)
    ok = "letra" in err(p, "dni") and foco(p) == "dni" and visible_paso(p) == "3"
    registrar(3, "DNI", "Rechaza letra de control incorrecta", f"12345678A → «{err(p,'dni')}»", ok)

    # 4. Edad (calculada respecto a la fecha real del navegador)
    hoy = p.evaluate("(()=>{const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()]})()")
    y, m, d = hoy
    cumple = f"{y-18}-{m:02d}-{d:02d}"
    import datetime
    manana = datetime.date(y, m, d) + datetime.timedelta(days=1)
    menor = f"{manana.year-18}-{manana.month:02d}-{manana.day:02d}"
    futura = f"{y+1}-01-01"
    datos_ok(p); r = {}
    for etiqueta, f in (("cumple hoy", cumple), ("cumple mañana", menor), ("futura", futura)):
        p.fill("#nacimiento", f); sig(p); r[etiqueta] = err(p, "nacimiento")
        if visible_paso(p) != "3": p.click("#btn-anterior")
    ok = r["cumple hoy"] == "" and "18" in r["cumple mañana"] and "futuro" in r["futura"]
    registrar(4, "Edad", "Acepta el día que cumple 18 y rechaza el anterior y futuras",
              f"{cumple} acepta · {menor} «{r['cumple mañana']}» · {futura} «{r['futura']}»", ok)
    p.fill("#nacimiento", "1995-04-12"); sig(p)

    # 5. Dirección
    direccion_ok(p); p.fill("#cp", "28013"); sig(p)
    e = err(p, "cp"); a = "Salamanca" in e and foco(p) == "cp"
    p.select_option("#provincia", "28"); corr = err(p, "cp") == ""
    ok = a and corr
    registrar(5, "Dirección", "Rechaza CP incompatible con la provincia", f"28013 + Salamanca → «{e}»; al elegir Madrid el error desaparece: {corr}", ok)

    # 6. Productos
    nueva(p); sig(p); sin_plan = err(p, "plan")
    p.check("#plan-plus"); sig(p); p.check("#comp-envio"); p.click("#btn-anterior"); p.check("#plan-pro")
    aviso = p.locator("#aviso-plan").is_visible()
    sig(p); sig(p); e = err(p, "complementos"); bloquea = visible_paso(p) == "2" and foco(p) == "comp-envio"
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/02-incompatibilidad.png", full_page=True)
    ok = bool(sin_plan) and aviso and bloquea and "Pro" in e
    registrar(6, "Productos", "Bloquea sin producto y complemento incompatible", f"sin plan «{sin_plan}» · Pro+envío «{e}» (aviso al cambiar de plan: {aviso})", ok)

    # 7. IBAN
    nueva(p); hasta_paso(p, 5); p.check("#pago-domiciliacion"); p.fill("#titular-cuenta", "María José"); p.fill("#iban", "ES91 2100 0418 4502 0005 1333"); sig(p)
    e = err(p, "iban"); ok = "control" in e and foco(p) == "iban"
    registrar(7, "IBAN", "Rechaza IBAN con formato correcto y control incorrecto", f"ES91…1333 → «{e}»", ok)

    # 8. Tarjeta
    p.check("#pago-tarjeta"); p.fill("#titular-tarjeta", "María José"); p.fill("#numero-tarjeta", "4111 1111 1111 1112"); p.fill("#caducidad", "01/24"); p.fill("#cvv", "12"); sig(p)
    e1, e2, e3 = err(p, "numero-tarjeta"), err(p, "caducidad"), err(p, "cvv")
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/03-tarjeta.png", full_page=True)
    ok = "válido" in e1 and "caducada" in e2 and "3 cifras" in e3 and foco(p) == "numero-tarjeta"
    registrar(8, "Tarjeta", "Detecta Luhn incorrecto, caducidad pasada y CVV inválido", f"«{e1}» · «{e2}» · «{e3}»", ok)

    # 9. Cambio de pago: con la tarjeta mal, pasar a domiciliación correcta
    p.check("#pago-domiciliacion"); p.fill("#iban", "ES91 2100 0418 4502 0005 1332")
    sin_err_tarjeta = err(p, "numero-tarjeta") == "" and not p.is_visible("#bloque-tarjeta")
    sig(p); paso = visible_paso(p); rev = p.locator("#revision").inner_text()
    a = paso == "6" and sin_err_tarjeta and "Tarjeta" not in rev and "1332" in rev
    p.click("[data-editar='5']"); p.check("#pago-tarjeta"); p.fill("#numero-tarjeta", ""); sig(p)
    exige = visible_paso(p) == "5" and bool(err(p, "numero-tarjeta"))
    ok = a and exige
    registrar(9, "Cambio de pago", "Ignora campos inactivos y exige los del nuevo método", f"domiciliación avanza a revisión sin datos de tarjeta: {a}; al volver a tarjeta exige número: {exige}", ok)
    p.check("#pago-domiciliacion"); p.click("#btn-volver-revision")

    # 10. Casillas
    p.click("#btn-confirmar"); e1, e2 = err(p, "acepto-condiciones"), err(p, "acepto-privacidad")
    a = bool(e1) and bool(e2) and foco(p) == "acepto-condiciones"
    p.check("#acepto-condiciones"); p.click("#btn-confirmar"); b2 = bool(err(p, "acepto-privacidad")) and "index" not in p.url
    p.check("#acepto-privacidad")
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/04-revision.png", full_page=True)
    ok = a and b2 and not p.is_checked("#acepto-comunicaciones")
    registrar(10, "Casillas", "Exige las dos obligatorias y permite rechazar publicidad", f"sin marcar: «{e1}» y «{e2}»; solo condiciones: sigue bloqueado; comunicaciones desmarcada", ok)

    # 11. KO con varios errores (se estropean datos de los pasos 3 y 4 desde la consola, como en una prueba manual)
    p.evaluate("document.getElementById('dni').value='12345678A'; document.getElementById('cp').value='28013';")
    p.click("#btn-confirmar")
    items = p.locator("#resumen-errores-lista li").all_inner_texts()
    a = visible_paso(p) == "3" and foco(p) == "dni" and len(items) == 2 and p.input_value("#nombre") == "María José"
    p.locator("#resumen-errores-lista a").nth(1).click()
    b2 = visible_paso(p) == "4" and foco(p) == "cp" and p.input_value("#localidad") == "Salamanca"
    p.fill("#cp", "37002"); quedan = p.locator("#resumen-errores-lista li").count()
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/05-resumen-errores.png")
    ok = a and b2 and quedan == 1
    registrar(11, "KO y corrección", "Abre el primer paso, enfoca, enlaces a otros pasos, conserva datos", f"resumen {items}; enlace 2 abre paso 4 y enfoca #cp; al corregir quedan {quedan}", ok)
    p.click("#resumen-errores-lista a"); p.fill("#dni", "12345678Z")

    # 12. Recorrido OK
    p.click("[data-ir='6']"); p.click("#btn-confirmar"); p.wait_for_url("**/index.html")
    p.wait_for_selector("#modal-exito.show", timeout=5000)
    texto = p.locator("#modal-exito-titulo").text_content().strip()
    if not SIN_HTML: p.screenshot(path=f"{CAPS}/06-modal-home.png")
    p.click("#modal-exito .btn-close"); p.wait_for_timeout(500); cerrado = not p.is_visible("#modal-exito")
    p.reload(); p.wait_for_timeout(800); tras_recarga = p.is_visible("#modal-exito")
    p2 = ctx.new_page(); p2.goto(f"{BASE}/index.html"); p2.wait_for_timeout(800); directo = p2.is_visible("#modal-exito"); p2.close()
    ok = texto == "Solicitud registrada correctamente" and cerrado and not tras_recarga and not directo
    registrar(12, "Recorrido OK", "Vuelve al home, modal una vez, no al recargar", f"modal «{texto}»; se cierra: {cerrado}; tras recargar: {tras_recarga}; entrando directo: {directo}", ok)

    # Extra: teclado y móvil
    nueva(p); p.focus("#plan-basico"); p.keyboard.press("ArrowRight"); p.keyboard.press("Tab"); p.keyboard.press("Enter")
    teclado = p.is_checked("#plan-plus") and visible_paso(p) == "2"
    print(("OK " if teclado else "KO ") + f"Teclado: flechas eligen plan y Tab+Enter avanza → {teclado}")
    if not SIN_HTML:
        nueva(p); p.screenshot(path=f"{CAPS}/00-paso1-escritorio.png", full_page=True)
        m = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        m.route("**/cdn.jsdelivr.net/**", cdn); m.route("**/cdnjs.cloudflare.com/**", cdn); m.route("**/fonts.googleapis.com/**", cdn)
        mp = m.new_page(); mp.goto(f"{BASE}/contratacion.html"); mp.check("#plan-plus"); mp.check("#comp-kit") if False else None
        mp.screenshot(path=f"{CAPS}/07-movil-paso1.png", full_page=True)
        ancho = mp.evaluate("document.documentElement.scrollWidth")
        print(("OK " if ancho <= 390 else "KO ") + f"Móvil 390px sin scroll horizontal (ancho {ancho})")
        m.close()
    b.close()
srv.terminate()
print("Errores de consola:", errores_consola or "ninguno")
json.dump(resultados, open(f"{CAPS}/resultados{'-sin-html' if SIN_HTML else ''}.json", "w"), ensure_ascii=False, indent=1)
print(f"{sum(r['ok'] for r in resultados)}/{len(resultados)} OK")
