using Hollowmark.Core;
using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// One-shot respawn beacon. Adds its own trigger sphere; tints its
    /// visual children green when lit.
    public class Checkpoint : MonoBehaviour
    {
        [SerializeField] private float triggerRadius = 2.5f;

        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
        private bool activated;

        private void Awake()
        {
            var trigger = gameObject.AddComponent<SphereCollider>();
            trigger.isTrigger = true;
            trigger.radius = triggerRadius;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (activated) return;
            if (other.GetComponentInParent<PlayerController>() == null) return;

            activated = true;
            GameEvents.RaiseCheckpointActivated(transform.position + Vector3.up * 1.2f);
            GameEvents.RaiseAnnounce("CHECKPOINT");

            var block = new MaterialPropertyBlock();
            foreach (var rendererItem in GetComponentsInChildren<Renderer>())
            {
                rendererItem.GetPropertyBlock(block);
                block.SetColor(BaseColorId, new Color(0.2f, 1f, 0.4f));
                rendererItem.SetPropertyBlock(block);
            }
        }
    }
}
