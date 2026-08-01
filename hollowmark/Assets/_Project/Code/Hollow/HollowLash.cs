using System.Collections;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Hollow
{
    /// While transformed, melee also detonates a radial shockwave.
    /// The first purchased Hollow power in the full game; free in the slice.
    [RequireComponent(typeof(HollowFormController))]
    public class HollowLash : MonoBehaviour
    {
        [SerializeField] private float damage = 40f;
        [SerializeField] private float radius = 6f;
        [SerializeField] private float knockbackForce = 12f;
        [SerializeField] private float cooldown = 3f;
        [SerializeField] private Color lashColor = new Color(0.55f, 0.2f, 0.8f);

        private HollowFormController form;
        private InputReader input;
        private float nextLashTime;

        private void Awake()
        {
            form = GetComponent<HollowFormController>();
            input = InputReader.EnsureExists();
        }

        private void OnEnable()
        {
            if (input != null) input.MeleePressed += HandleMeleePressed;
        }

        private void OnDisable()
        {
            if (input != null) input.MeleePressed -= HandleMeleePressed;
        }

        private void HandleMeleePressed()
        {
            if (form == null || !form.IsTransformed || Time.time < nextLashTime) return;
            nextLashTime = Time.time + cooldown;
            Detonate();
        }

        private void Detonate()
        {
            Vector3 center = transform.position + Vector3.up * 1f;
            var colliders = Physics.OverlapSphere(center, radius,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);

            var hitRoots = new System.Collections.Generic.HashSet<Transform>();
            foreach (var collider in colliders)
            {
                Transform root = collider.transform.root;
                if (root == transform.root || hitRoots.Contains(root)) continue;

                var damageable = collider.GetComponentInParent<IDamageable>();
                if (damageable == null || damageable.IsDead || damageable.Faction == Faction.Player) continue;
                hitRoots.Add(root);

                Vector3 away = collider.bounds.center - center;
                away.y = 0f;
                away = away.sqrMagnitude > 0.001f ? away.normalized : Vector3.forward;

                var info = new DamageInfo(damage * PlayerBuffs.MeleeDamage, gameObject, Faction.Player)
                {
                    Point = collider.bounds.center,
                    Normal = -away,
                    Knockback = away * knockbackForce + Vector3.up * 4f,
                    FromHollow = true,
                };
                damageable.TakeDamage(info);
            }

            StartCoroutine(ShockwaveVisual(center));
        }

        private IEnumerator ShockwaveVisual(Vector3 center)
        {
            var sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            sphere.name = "HollowLashWave";
            var collider = sphere.GetComponent<Collider>();
            if (collider != null) Destroy(collider);

            var renderer = sphere.GetComponent<Renderer>();
            if (renderer != null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Unlit");
                if (shader != null)
                {
                    var material = new Material(shader);
                    material.SetColor("_BaseColor", lashColor);
                    renderer.material = material;
                }
            }

            sphere.transform.position = center;
            float duration = 0.25f;
            float elapsed = 0f;
            while (elapsed < duration && sphere != null)
            {
                elapsed += Time.deltaTime;
                float scale = Mathf.Lerp(0.5f, radius * 2f, elapsed / duration);
                sphere.transform.localScale = Vector3.one * scale;
                yield return null;
            }
            if (sphere != null) Destroy(sphere);
        }
    }
}
