using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// Invisible ReachZone objective target. Adds its own trigger sphere.
    public class MissionZone : MonoBehaviour
    {
        [SerializeField, Tooltip("Must match the objective's zoneId.")]
        private string zoneId = "zone";
        [SerializeField] private float triggerRadius = 3f;

        private bool consumed;

        private void Awake()
        {
            var trigger = gameObject.AddComponent<SphereCollider>();
            trigger.isTrigger = true;
            trigger.radius = triggerRadius;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (consumed) return;
            if (other.GetComponentInParent<PlayerController>() == null) return;
            consumed = true;
            MissionTracker.NotifyZoneReached(zoneId);
        }
    }
}
