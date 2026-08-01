using System;
using UnityEngine;
using UnityEngine.InputSystem;

namespace Hollowmark.Core
{
    /// Central input surface. Actions are defined in code so the slice runs
    /// with zero asset configuration; migrate to an .inputactions asset later
    /// without touching consumers.
    ///
    /// Look semantics: Look is pointer delta (pixels per frame, use directly
    /// with a small sensitivity); LookStick is the gamepad right stick
    /// (-1..1, scale by degrees-per-second * deltaTime).
    public class InputReader : MonoBehaviour
    {
        public static InputReader Instance { get; private set; }

        [SerializeField, Tooltip("Lock and hide the cursor for mouse look.")]
        private bool lockCursor = true;

        // Polled state
        public Vector2 Move { get; private set; }
        public Vector2 Look { get; private set; }
        public Vector2 LookStick { get; private set; }
        public bool JumpHeld { get; private set; }
        public bool FireHeld { get; private set; }

        // Edge events
        public event Action JumpPressed;
        public event Action JumpReleased;
        public event Action DashPressed;
        public event Action MeleePressed;
        public event Action FirePressed;
        public event Action FireReleased;
        /// +1 = next core, -1 = previous core.
        public event Action<int> SwapCore;
        public event Action TransformPressed;
        public event Action InteractPressed;
        public event Action MountPressed;

        private InputAction moveAction, lookAction, lookStickAction, jumpAction, dashAction,
            meleeAction, fireAction, swapNextAction, swapPrevAction, transformAction,
            interactAction, mountAction;

        /// Finds or creates the singleton; safe to call from any Awake.
        public static InputReader EnsureExists()
        {
            if (Instance != null) return Instance;
            var existing = FindFirstObjectByType<InputReader>();
            if (existing != null)
            {
                Instance = existing;
                return existing;
            }
            var go = new GameObject("[InputReader]");
            return go.AddComponent<InputReader>();
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            CreateActions();

            if (lockCursor)
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
            }
        }

        private void CreateActions()
        {
            moveAction = new InputAction("Move", InputActionType.Value, expectedControlType: "Vector2");
            moveAction.AddCompositeBinding("2DVector")
                .With("Up", "<Keyboard>/w")
                .With("Down", "<Keyboard>/s")
                .With("Left", "<Keyboard>/a")
                .With("Right", "<Keyboard>/d");
            moveAction.AddBinding("<Gamepad>/leftStick");
            moveAction.performed += ctx => Move = ctx.ReadValue<Vector2>();
            moveAction.canceled += _ => Move = Vector2.zero;

            lookAction = new InputAction("Look", InputActionType.Value, expectedControlType: "Vector2");
            lookAction.AddBinding("<Pointer>/delta");
            lookAction.performed += ctx => Look = ctx.ReadValue<Vector2>();
            lookAction.canceled += _ => Look = Vector2.zero;

            lookStickAction = new InputAction("LookStick", InputActionType.Value, expectedControlType: "Vector2");
            lookStickAction.AddBinding("<Gamepad>/rightStick");
            lookStickAction.performed += ctx => LookStick = ctx.ReadValue<Vector2>();
            lookStickAction.canceled += _ => LookStick = Vector2.zero;

            jumpAction = MakeButton("Jump", new[] { "<Keyboard>/space", "<Gamepad>/buttonSouth" },
                () => { JumpHeld = true; JumpPressed?.Invoke(); },
                () => { JumpHeld = false; JumpReleased?.Invoke(); });

            dashAction = MakeButton("Dash", new[] { "<Keyboard>/leftShift", "<Gamepad>/buttonEast" },
                () => DashPressed?.Invoke());

            meleeAction = MakeButton("Melee", new[] { "<Keyboard>/f", "<Gamepad>/buttonWest" },
                () => MeleePressed?.Invoke());

            fireAction = MakeButton("Fire", new[] { "<Mouse>/leftButton", "<Gamepad>/rightTrigger" },
                () => { FireHeld = true; FirePressed?.Invoke(); },
                () => { FireHeld = false; FireReleased?.Invoke(); });

            swapNextAction = MakeButton("SwapCoreNext", new[] { "<Keyboard>/e", "<Gamepad>/rightShoulder" },
                () => SwapCore?.Invoke(1));

            swapPrevAction = MakeButton("SwapCorePrev", new[] { "<Keyboard>/q", "<Gamepad>/leftShoulder" },
                () => SwapCore?.Invoke(-1));

            transformAction = MakeButton("Transform", new[] { "<Keyboard>/t", "<Gamepad>/dpad/up" },
                () => TransformPressed?.Invoke());

            interactAction = MakeButton("Interact", new[] { "<Keyboard>/c", "<Gamepad>/buttonNorth" },
                () => InteractPressed?.Invoke());

            mountAction = MakeButton("Mount", new[] { "<Keyboard>/x", "<Gamepad>/dpad/down" },
                () => MountPressed?.Invoke());
        }

        private static InputAction MakeButton(string name, string[] bindings, Action onPressed, Action onReleased = null)
        {
            var action = new InputAction(name, InputActionType.Button);
            foreach (var binding in bindings)
                action.AddBinding(binding);
            action.performed += _ => onPressed?.Invoke();
            if (onReleased != null)
                action.canceled += _ => onReleased();
            return action;
        }

        private void OnEnable()
        {
            SetActionsEnabled(true);
        }

        private void OnDisable()
        {
            SetActionsEnabled(false);
            Move = Vector2.zero;
            Look = Vector2.zero;
            LookStick = Vector2.zero;
            JumpHeld = false;
            FireHeld = false;
        }

        private void SetActionsEnabled(bool enabled)
        {
            var actions = AllActions();
            foreach (var action in actions)
            {
                if (action == null) continue;
                if (enabled) action.Enable();
                else action.Disable();
            }
        }

        private InputAction[] AllActions() => new[]
        {
            moveAction, lookAction, lookStickAction, jumpAction, dashAction, meleeAction,
            fireAction, swapNextAction, swapPrevAction, transformAction, interactAction, mountAction,
        };

        private void OnDestroy()
        {
            if (Instance == this) Instance = null;
            foreach (var action in AllActions())
                action?.Dispose();
        }
    }
}
