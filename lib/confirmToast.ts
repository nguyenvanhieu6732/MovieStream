import { toast } from "sonner"

function confirmToast(message: string, onConfirm: () => void) {
  toast(message, {
    duration: 10000,
    action: {
      label: "Xác nhận",
      onClick: onConfirm,
    },
    cancel: {
      label: "Hủy",
    },
  })
}
export default confirmToast