import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigs, KeyDownAction } from '../api';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';

type ActionField = { [K in keyof AppConfigs]-?: NonNullable<AppConfigs[K]> extends KeyDownAction ? K : never }[keyof AppConfigs];

interface ActionRow {
    label: string
    field: ActionField
    desc?: string
    /** desc 里 {{p1}} 对应的按键名 */
    key?: string
}

/** 遥控与手势：换台、遥控器按键、长按、全屏手势（App 按设备只显示其一，网页面板全列出并标明） */
@Component({
    selector: 'app-control',
    imports: [
        NgTemplateOutlet,
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        TranslateModule,
        ...SETTINGS_UI,
    ],
    templateUrl: './control.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class ControlComponent extends SettingsPageBase {
    /** 与 App 选择列表的顺序相同 */
    actions: KeyDownAction[] = [
        KeyDownAction.ChangeCurrentChannelToPrev,
        KeyDownAction.ChangeCurrentChannelToNext,
        KeyDownAction.ChangeCurrentChannelLineIdxToPrev,
        KeyDownAction.ChangeCurrentChannelLineIdxToNext,
        KeyDownAction.SeekForward,
        KeyDownAction.SeekBackward,
        KeyDownAction.ToIptvSourceScreen,
        KeyDownAction.ToChannelScreen,
        KeyDownAction.ToQuickOpScreen,
        KeyDownAction.ToEpgScreen,
        KeyDownAction.ToChannelLineScreen,
        KeyDownAction.ToVideoPlayerControllerScreen,
        KeyDownAction.BrightnessUp,
        KeyDownAction.BrightnessDown,
        KeyDownAction.VolumeUp,
        KeyDownAction.VolumeDown,
        KeyDownAction.NoAction,
    ];
    actionLabels: Record<KeyDownAction, string> = {
        ChangeCurrentChannelToPrev: 'TV.ui_keydown_action_previous_channel',
        ChangeCurrentChannelToNext: 'TV.ui_keydown_action_next_channel',
        ChangeCurrentChannelLineIdxToPrev: 'TV.ui_keydown_action_previous_line',
        ChangeCurrentChannelLineIdxToNext: 'TV.ui_keydown_action_next_line',
        ToIptvSourceScreen: 'TV.ui_keydown_action_manage_sources',
        ToChannelScreen: 'TV.ui_keydown_action_channel_list',
        ToQuickOpScreen: 'TV.ui_keydown_action_quick_settings',
        ToEpgScreen: 'TV.ui_keydown_action_program_list',
        ToChannelLineScreen: 'TV.ui_keydown_action_line_list',
        ToVideoPlayerControllerScreen: 'TV.ui_keydown_action_playback_control',
        BrightnessUp: 'TV.ui_keydown_action_brightness_up',
        BrightnessDown: 'TV.ui_keydown_action_brightness_down',
        VolumeUp: 'TV.ui_keydown_action_volume_up',
        VolumeDown: 'TV.ui_keydown_action_volume_down',
        NoAction: 'TV.ui_keydown_action_no_action',
        SeekForward: 'TV.ui_keydown_action_seek_forward',
        SeekBackward: 'TV.ui_keydown_action_seek_backward',
    };

    keys: ActionRow[] = [
        { label: 'TV.ui_control_up', field: 'keyDownEventUp' },
        { label: 'TV.ui_control_down', field: 'keyDownEventDown' },
        { label: 'TV.ui_control_left', field: 'keyDownEventLeft' },
        { label: 'TV.ui_control_right', field: 'keyDownEventRight' },
        { label: 'TV.ui_control_select', field: 'keyDownEventSelect' },
    ];
    longKeys: ActionRow[] = [
        { label: 'TV.ui_control_long_select', field: 'keyDownEventLongSelect' },
        { label: 'TV.ui_control_long_up', field: 'keyDownEventLongUp' },
        { label: 'TV.ui_control_long_down', field: 'keyDownEventLongDown' },
        { label: 'TV.ui_control_long_left', field: 'keyDownEventLongLeft' },
        { label: 'TV.ui_control_long_right', field: 'keyDownEventLongRight' },
    ];
    /** 左右滑、单击、长按与遥控器对应按键是同一项设置（与 App 相同） */
    gestures: ActionRow[] = [
        { label: 'TV.ui_gesture_zone_left_up', field: 'gestureZoneLeftUp' },
        { label: 'TV.ui_gesture_zone_left_down', field: 'gestureZoneLeftDown' },
        { label: 'TV.ui_gesture_zone_middle_up', field: 'gestureZoneMiddleUp' },
        { label: 'TV.ui_gesture_zone_middle_down', field: 'gestureZoneMiddleDown' },
        { label: 'TV.ui_gesture_zone_right_up', field: 'gestureZoneRightUp' },
        { label: 'TV.ui_gesture_zone_right_down', field: 'gestureZoneRightDown' },
        { label: 'TV.settings_control_swipe_left', field: 'keyDownEventLeft', desc: 'TV.settings_control_same_as_key', key: 'TV.ui_control_left' },
        { label: 'TV.settings_control_swipe_right', field: 'keyDownEventRight', desc: 'TV.settings_control_same_as_key', key: 'TV.ui_control_right' },
        { label: 'TV.settings_control_tap', field: 'keyDownEventSelect', desc: 'TV.settings_control_fullscreen_same_as_key', key: 'TV.ui_control_select' },
        { label: 'TV.settings_control_long_press', field: 'keyDownEventLongSelect', desc: 'TV.settings_control_fullscreen_same_as_key', key: 'TV.ui_control_long_select' },
    ];

    setAction(field: ActionField, action: KeyDownAction) {
        this.c[field] = action;
        this.save();
    }
}
