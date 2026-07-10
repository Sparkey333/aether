using System.Collections;
using Hollowmark.Combat;
using Hollowmark.Core;
using Hollowmark.Hollow;
using Hollowmark.Systems;
using UnityEngine;
using UnityEngine.UI;

namespace Hollowmark.UI
{
    /// Builds the entire HUD from code at startup (no prefabs, no TMP):
    /// health / Hollow / corruption bars, core + ammo, sparks, boss bar,
    /// announcements, and the death fade.
    public class HUDController : MonoBehaviour
    {
        private const float HealthWidth = 300f;
        private const float HollowWidth = 300f;
        private const float BossWidth = 500f;

        private Font font;
        private RectTransform canvasRect;
        private Image healthFill, hollowFill, corruptionFill, bossFill, deathOverlay;
        private Text coreText, ammoText, sparksText, announceText, bossNameText, deathText;
        private GameObject bossGroup;

        private Health boundHealth;
        private HollowFormController boundForm;
        private Splitfang boundGun;
        private Coroutine announceRoutine, deathRoutine;

        private void Awake()
        {
            font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (font == null)
                Debug.LogWarning("HUDController: built-in LegacyRuntime.ttf not found; text will be invisible.");
            BuildCanvas();
        }

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
            GameEvents.PlayerDied += HandlePlayerDied;
            GameEvents.SparksChanged += HandleSparksChanged;
            GameEvents.BossHealthChanged += HandleBossHealthChanged;
            GameEvents.Announce += HandleAnnounce;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
            GameEvents.PlayerDied -= HandlePlayerDied;
            GameEvents.SparksChanged -= HandleSparksChanged;
            GameEvents.BossHealthChanged -= HandleBossHealthChanged;
            GameEvents.Announce -= HandleAnnounce;
            UnbindPlayer();
        }

        private void Start()
        {
            HandleSparksChanged(0, SparkWallet.Total);
        }

        // ---------- construction ----------

        private void BuildCanvas()
        {
            var canvasGo = new GameObject("HUDCanvas",
                typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasGo.transform.SetParent(transform, false);
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasGo.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            canvasRect = (RectTransform)canvasGo.transform;

            // Bottom-left vitals
            healthFill = CreateBar("Health", new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(20f, 70f), new Vector2(HealthWidth, 22f),
                new Color(0f, 0f, 0f, 0.6f), new Color(0.85f, 0.2f, 0.2f));
            hollowFill = CreateBar("Hollow", new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(20f, 44f), new Vector2(HollowWidth, 14f),
                new Color(0f, 0f, 0f, 0.6f), new Color(0.55f, 0.2f, 0.85f));
            corruptionFill = CreateBar("Corruption", new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(20f, 36f), new Vector2(HollowWidth, 5f),
                new Color(0f, 0f, 0f, 0.6f), new Color(0.5f, 0.8f, 0.2f));
            SetFill(healthFill, HealthWidth, 1f);
            SetFill(hollowFill, HollowWidth, 0f);
            SetFill(corruptionFill, HollowWidth, 0f);

            // Bottom-right weapon
            coreText = CreateText("CoreText", new Vector2(1f, 0f), new Vector2(1f, 0f),
                new Vector2(-20f, 50f), 26, TextAnchor.LowerRight, new Color(0.7f, 0.95f, 1f));
            ammoText = CreateText("AmmoText", new Vector2(1f, 0f), new Vector2(1f, 0f),
                new Vector2(-20f, 20f), 30, TextAnchor.LowerRight, Color.white);

            // Top-right sparks
            sparksText = CreateText("SparksText", new Vector2(1f, 1f), new Vector2(1f, 1f),
                new Vector2(-20f, -20f), 28, TextAnchor.UpperRight, new Color(1f, 0.85f, 0.2f));

            // Top-center boss bar (hidden until a boss speaks up)
            bossGroup = new GameObject("BossGroup", typeof(RectTransform));
            bossGroup.transform.SetParent(canvasRect, false);
            var bossRect = (RectTransform)bossGroup.transform;
            bossRect.anchorMin = bossRect.anchorMax = new Vector2(0.5f, 1f);
            bossRect.pivot = new Vector2(0.5f, 1f);
            bossRect.anchoredPosition = new Vector2(0f, -24f);
            bossRect.sizeDelta = new Vector2(BossWidth, 60f);
            bossNameText = CreateText("BossName", new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
                Vector2.zero, 24, TextAnchor.UpperCenter, new Color(1f, 0.6f, 0.5f), bossRect);
            bossFill = CreateBar("BossBar", new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
                new Vector2(0f, -32f), new Vector2(BossWidth, 16f),
                new Color(0f, 0f, 0f, 0.6f), new Color(0.9f, 0.25f, 0.2f), bossRect);
            bossGroup.SetActive(false);

            // Center announcements
            announceText = CreateText("Announce", new Vector2(0.5f, 0.68f), new Vector2(0.5f, 0.5f),
                Vector2.zero, 40, TextAnchor.MiddleCenter, Color.white);
            announceText.color = new Color(1f, 1f, 1f, 0f);

            // Death fade
            var overlayGo = new GameObject("DeathOverlay", typeof(RectTransform), typeof(Image));
            overlayGo.transform.SetParent(canvasRect, false);
            var overlayRect = (RectTransform)overlayGo.transform;
            overlayRect.anchorMin = Vector2.zero;
            overlayRect.anchorMax = Vector2.one;
            overlayRect.sizeDelta = Vector2.zero;
            deathOverlay = overlayGo.GetComponent<Image>();
            deathOverlay.color = new Color(0f, 0f, 0f, 0f);
            deathOverlay.raycastTarget = false;
            deathText = CreateText("DeathText", new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                Vector2.zero, 56, TextAnchor.MiddleCenter, new Color(0.9f, 0.2f, 0.2f, 0f), overlayRect);
        }

        private Image CreateBar(string name, Vector2 anchor, Vector2 pivot, Vector2 position,
            Vector2 size, Color background, Color fillColor, RectTransform parent = null)
        {
            var bgGo = new GameObject(name, typeof(RectTransform), typeof(Image));
            bgGo.transform.SetParent(parent != null ? parent : canvasRect, false);
            var bgRect = (RectTransform)bgGo.transform;
            bgRect.anchorMin = bgRect.anchorMax = anchor;
            bgRect.pivot = pivot;
            bgRect.anchoredPosition = position;
            bgRect.sizeDelta = size;
            bgGo.GetComponent<Image>().color = background;

            var fillGo = new GameObject("Fill", typeof(RectTransform), typeof(Image));
            fillGo.transform.SetParent(bgRect, false);
            var fillRect = (RectTransform)fillGo.transform;
            fillRect.anchorMin = new Vector2(0f, 0f);
            fillRect.anchorMax = new Vector2(0f, 1f);
            fillRect.pivot = new Vector2(0f, 0.5f);
            fillRect.anchoredPosition = Vector2.zero;
            fillRect.sizeDelta = new Vector2(size.x, 0f);
            var fill = fillGo.GetComponent<Image>();
            fill.color = fillColor;
            return fill;
        }

        private Text CreateText(string name, Vector2 anchor, Vector2 pivot, Vector2 position,
            int fontSize, TextAnchor alignment, Color color, RectTransform parent = null)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent != null ? parent : canvasRect, false);
            var rect = (RectTransform)go.transform;
            rect.anchorMin = rect.anchorMax = anchor;
            rect.pivot = pivot;
            rect.anchoredPosition = position;
            rect.sizeDelta = new Vector2(700f, 60f);
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = fontSize;
            text.alignment = alignment;
            text.color = color;
            text.raycastTarget = false;
            return text;
        }

        private static void SetFill(Image fill, float totalWidth, float fraction)
        {
            if (fill == null) return;
            var rect = (RectTransform)fill.transform;
            rect.sizeDelta = new Vector2(totalWidth * Mathf.Clamp01(fraction), 0f);
        }

        // ---------- player binding ----------

        private void HandlePlayerSpawned(GameObject player)
        {
            UnbindPlayer();
            if (player == null) return;

            boundHealth = player.GetComponent<Health>();
            if (boundHealth != null)
            {
                boundHealth.Changed += HandleHealthChanged;
                HandleHealthChanged(boundHealth.Current, boundHealth.Max);
            }

            boundForm = player.GetComponent<HollowFormController>();
            if (boundForm != null)
            {
                boundForm.MeterChanged += HandleMeterChanged;
                boundForm.CorruptionChanged += HandleCorruptionChanged;
            }

            boundGun = player.GetComponent<Splitfang>();
            if (boundGun != null)
            {
                boundGun.CoreChanged += HandleCoreChanged;
                boundGun.AmmoChanged += HandleAmmoChanged;
                if (boundGun.CurrentCore != null)
                {
                    HandleCoreChanged(boundGun.CurrentCore);
                    HandleAmmoChanged(boundGun.GetAmmo(boundGun.CurrentCore), boundGun.CurrentCore.maxAmmo);
                }
            }

            if (deathRoutine != null) StopCoroutine(deathRoutine);
            deathRoutine = StartCoroutine(FadeDeath(0f));
        }

        private void UnbindPlayer()
        {
            if (boundHealth != null) boundHealth.Changed -= HandleHealthChanged;
            if (boundForm != null)
            {
                boundForm.MeterChanged -= HandleMeterChanged;
                boundForm.CorruptionChanged -= HandleCorruptionChanged;
            }
            if (boundGun != null)
            {
                boundGun.CoreChanged -= HandleCoreChanged;
                boundGun.AmmoChanged -= HandleAmmoChanged;
            }
            boundHealth = null;
            boundForm = null;
            boundGun = null;
        }

        // ---------- handlers ----------

        private void HandleHealthChanged(float current, float max) =>
            SetFill(healthFill, HealthWidth, max > 0f ? current / max : 0f);

        private void HandleMeterChanged(float current, float max) =>
            SetFill(hollowFill, HollowWidth, max > 0f ? current / max : 0f);

        private void HandleCorruptionChanged(float current, float max) =>
            SetFill(corruptionFill, HollowWidth, max > 0f ? current / max : 0f);

        private void HandleCoreChanged(GunCoreDefinition core)
        {
            if (coreText != null && core != null)
                coreText.text = core.displayName.ToUpperInvariant();
        }

        private void HandleAmmoChanged(int current, int max)
        {
            if (ammoText != null)
                ammoText.text = $"{current} / {max}";
        }

        private void HandleSparksChanged(int delta, int total)
        {
            if (sparksText != null)
                sparksText.text = $"SPARKS {total}";
        }

        private void HandleBossHealthChanged(string bossName, float normalized)
        {
            if (bossGroup == null) return;
            bool show = normalized > 0f;
            bossGroup.SetActive(show);
            if (show)
            {
                if (bossNameText != null) bossNameText.text = bossName;
                SetFill(bossFill, BossWidth, normalized);
            }
        }

        private void HandleAnnounce(string message)
        {
            if (announceText == null) return;
            if (announceRoutine != null) StopCoroutine(announceRoutine);
            announceRoutine = StartCoroutine(AnnounceRoutine(message));
        }

        private void HandlePlayerDied()
        {
            if (deathRoutine != null) StopCoroutine(deathRoutine);
            deathRoutine = StartCoroutine(FadeDeath(0.7f));
        }

        // ---------- coroutines ----------

        private IEnumerator AnnounceRoutine(string message)
        {
            announceText.text = message;
            announceText.color = Color.white;
            yield return new WaitForSeconds(1.4f);
            float elapsed = 0f;
            const float fade = 0.8f;
            while (elapsed < fade)
            {
                elapsed += Time.deltaTime;
                announceText.color = new Color(1f, 1f, 1f, 1f - elapsed / fade);
                yield return null;
            }
            announceRoutine = null;
        }

        private IEnumerator FadeDeath(float targetAlpha)
        {
            if (deathOverlay == null) yield break;
            float start = deathOverlay.color.a;
            float elapsed = 0f;
            const float duration = 0.5f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float alpha = Mathf.Lerp(start, targetAlpha, elapsed / duration);
                deathOverlay.color = new Color(0f, 0f, 0f, alpha);
                if (deathText != null)
                {
                    deathText.text = "DOWNED";
                    deathText.color = new Color(0.9f, 0.2f, 0.2f, alpha > 0.05f ? alpha + 0.3f : 0f);
                }
                yield return null;
            }
            deathRoutine = null;
        }
    }
}
