import { EventManagerElement } from "../api/Interfaces";
import { EventAction } from "../api/Enums";

export class EventManagerProvider {
    public static eventList: Array<EventManagerElement> = [
        //Minecraft server events
        {
            name: "minecraft:player_attacked_entity",
            client_action: EventAction.NO,
            server_action: EventAction.LISTEN,
        },
        //Client to server events
        {
            name: "mcbestudio:client_entered_world",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:enter_place_keyframe_mode",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:generate_sequence",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:delete_sequence",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:progress_bar_opened",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        //Client to server timeline events
        {
            name: "mcbestudio:go_to_first_frame",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:go_to_last_frame",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:go_to_next_frame",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:go_to_previous_frame",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:go_to_play",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:go_to_pause",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        //Client to server tools
        {
            name: "mcbestudio:move_keyframe",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:delete_keyframe",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:delete_all_keyframes",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        {
            name: "mcbestudio:cut_sequence",
            client_action: EventAction.REGISTER,
            server_action: EventAction.LISTEN,
        },
        //Server to client
        {
            name: "mcbestudio:exit_place_keyframe_mode",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:update_frame_number",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:open_modal",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:close_modal",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:update_modal_value",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:leave_full_screen",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:notify_sequence_ended",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: "mcbestudio:notify_current_frame",
            client_action: EventAction.LISTEN,
            server_action: EventAction.REGISTER,
        },
        {
            name: 'minecraft:client_entered_world',
            client_action: EventAction.LISTEN,
            server_action: EventAction.NO
        },
        {
            name: 'minecraft:ui_event',
            client_action: EventAction.LISTEN,
            server_action: EventAction.NO
        }

    ]
}