using Hollowmark.Core;
using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Skiff
{
    /// Handles getting on and off the Skiff: parks the player's own
    /// locomotion, parents them to the seat, and retargets the camera.
    [RequireComponent(typeof(SkiffController))]
    public class SkiffMount : MonoBehaviour
    {
        [SerializeField] private float mountRadius = 2.5f;
        [SerializeField] private Vector3 seatLocalPosition = new Vector3(0f, 0.7f, 0f);

        private SkiffController skiff;
        private InputReader input;
        private Transform seat;
        private Transform playerTransform;
        private PlayerController playerController;
        private PlayerMotor playerMotor;
        private CharacterController playerCharacterController;
        private bool mounted;
        private bool promptShown;

        private void Awake()
        {
            skiff = GetComponent<SkiffController>();
            input = InputReader.EnsureExists();

            var seatGo = new GameObject("Seat");
            seatGo.transform.SetParent(transform, false);
            seatGo.transform.localPosition = seatLocalPosition;
            seat = seatGo.transform;
        }

        private void OnEnable()
        {
            if (input != null) input.MountPressed += HandleMountPressed;
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
        }

        private void OnDisable()
        {
            if (input != null) input.MountPressed -= HandleMountPressed;
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
        }

        private void HandlePlayerSpawned(GameObject player)
        {
            if (mounted || player == null) return;
            playerTransform = player.transform;
            playerController = player.GetComponent<PlayerController>();
            playerMotor = player.GetComponent<PlayerMotor>();
            playerCharacterController = player.GetComponent<CharacterController>();
        }

        private void Update()
        {
            if (mounted || playerTransform == null) return;

            bool near = Vector3.Distance(transform.position, playerTransform.position) <= mountRadius;
            if (near && !promptShown)
            {
                promptShown = true;
                GameEvents.RaiseAnnounce("X — RIDE THE SKIFF");
            }
            else if (!near)
            {
                promptShown = false;
            }
        }

        private void HandleMountPressed()
        {
            if (mounted)
            {
                Dismount();
            }
            else if (playerTransform != null &&
                     Vector3.Distance(transform.position, playerTransform.position) <= mountRadius)
            {
                Mount();
            }
        }

        private void Mount()
        {
            if (playerTransform == null) return;
            mounted = true;
            skiff.IsMounted = true;

            if (playerCharacterController != null) playerCharacterController.enabled = false;
            if (playerMotor != null)
            {
                playerMotor.MoveLocked = true;
                playerMotor.enabled = false;
            }
            if (playerController != null) playerController.enabled = false;

            playerTransform.SetParent(seat, worldPositionStays: false);
            playerTransform.localPosition = Vector3.zero;
            playerTransform.localRotation = Quaternion.identity;

            RetargetCamera(transform);
        }

        private void Dismount()
        {
            mounted = false;
            skiff.IsMounted = false;
            if (playerTransform == null) return;

            playerTransform.SetParent(null);
            playerTransform.rotation = Quaternion.Euler(0f, transform.eulerAngles.y, 0f);
            playerTransform.position = transform.position - transform.right * 1.5f + Vector3.up * 1.2f;

            if (playerCharacterController != null) playerCharacterController.enabled = true;
            if (playerMotor != null)
            {
                playerMotor.enabled = true;
                playerMotor.MoveLocked = false;
            }
            if (playerController != null) playerController.enabled = true;

            RetargetCamera(playerTransform);
        }

        private void RetargetCamera(Transform target)
        {
            var camera = FindFirstObjectByType<OrbitCamera>();
            if (camera != null) camera.SetTarget(target);
            else Debug.LogWarning("SkiffMount: no OrbitCamera found to retarget.", this);
        }
    }
}
